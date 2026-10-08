"""
MongoDB connection and adaptive-learning collection access.

The MongoClient is created once per engine process and reused for all requests.
"""

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.database import Database

from app.config import get_settings

_client: MongoClient | None = None
_database: Database | None = None

TOPIC_TAXONOMY_SEED = [
    {
        "id": "physics_vectors_basics",
        "subject": "physics",
        "chapter": "mathematical_tools",
        "topic": "vectors",
        "concept": "vector_addition",
        "prerequisite_topic_ids": [],
    },
    {
        "id": "physics_kinematics_1d",
        "subject": "physics",
        "chapter": "kinematics",
        "topic": "rectilinear_motion",
        "concept": "acceleration_velocity",
        "prerequisite_topic_ids": ["physics_vectors_basics"],
    },
    {
        "id": "physics_electrostatics_ef",
        "subject": "physics",
        "chapter": "electrostatics",
        "topic": "electric_field",
        "concept": "coulombs_law_flux",
        "prerequisite_topic_ids": ["physics_vectors_basics"],
    },
    {
        "id": "physics_electrostatics_pot",
        "subject": "physics",
        "chapter": "electrostatics",
        "topic": "potential",
        "concept": "electric_potential_energy",
        "prerequisite_topic_ids": ["physics_electrostatics_ef"],
    },
    {
        "id": "chemistry_mole_concept",
        "subject": "chemistry",
        "chapter": "physical_chemistry",
        "topic": "mole_concept",
        "concept": "stoichiometry",
        "prerequisite_topic_ids": [],
    },
    {
        "id": "maths_calculus_limits",
        "subject": "maths",
        "chapter": "calculus",
        "topic": "limits_continuity",
        "concept": "standard_limits",
        "prerequisite_topic_ids": [],
    },
]


def get_mongodb_database() -> Database:
    """Return the shared NotepediaX MongoDB database."""
    global _client, _database
    if _database is None:
        settings = get_settings()
        if not settings.mongodb_uri:
            raise RuntimeError(
                "Adaptive engine requires MONGODB_URI in its environment."
            )
        _client = MongoClient(settings.mongodb_uri, appname="NotepediaXAdaptiveEngine")
        _database = _client.get_database(settings.mongodb_database)
    return _database


def ensure_adaptive_collections() -> None:
    """Create focused indexes and seed canonical learning topics if absent."""
    db = get_mongodb_database()
    db.learner_states.create_index([("student_id", ASCENDING)], unique=True)
    db.learning_events.create_index(
        [("student_id", ASCENDING), ("topic_id", ASCENDING), ("created_at", DESCENDING)]
    )
    db.topic_taxonomy.create_index([("id", ASCENDING)], unique=True)
    db.learning_plans.create_index(
        [("student_id", ASCENDING), ("plan_date", ASCENDING)], unique=True
    )
    db.learning_plans.create_index([("id", ASCENDING)], unique=True)

    if db.topic_taxonomy.count_documents({}) == 0:
        db.topic_taxonomy.insert_many(TOPIC_TAXONOMY_SEED)


def get_student_profile(student_id: str) -> dict | None:
    """Fetch the authoritative profile from the existing student collections."""
    from bson import ObjectId

    if not ObjectId.is_valid(student_id):
        return None

    db = get_mongodb_database()
    object_id = ObjectId(student_id)
    for collection_name, role in (
        ("elitestudents", "elite_student"),
        ("freestudents", "free_student"),
    ):
        student = db[collection_name].find_one(
            {"_id": object_id},
            {"password_hash": 0, "password": 0},
        )
        if student:
            return {
                "id": str(student["_id"]),
                "name": student.get("name", ""),
                "academic_level": student.get("academicLevel") or student.get("academic_level") or "unspecified",
                "exam_target": student.get("targetExam") or student.get("exam_target") or "JEE_MAIN",
                "target_score": int(student.get("targetScore") or student.get("target_score") or 0),
                "daily_available_minutes": int(
                    student.get("dailyAvailableMinutes")
                    or student.get("daily_available_minutes")
                    or 60
                ),
                "preferred_language": student.get("preferredLanguage") or "en",
                "role": role,
                "created_at": student.get("createdAt"),
            }
    return None
