from fastapi import APIRouter

router = APIRouter()

SAMPLE_SCHEMA = {
    "database": "school_management",
    "db_type": "mysql",
    "nodes": [
        {
            "id": "students",
            "label": "Students",
            "columns": [
                "student_id (PK)",
                "first_name",
                "last_name",
                "email",
                "phone",
                "dob",
                "enrollment_year",
                "department_id (FK)"
            ]
        },
        {
            "id": "departments",
            "label": "Departments",
            "columns": [
                "department_id (PK)",
                "name",
                "building",
                "head_of_department (FK:teachers)"
            ]
        },
        {
            "id": "teachers",
            "label": "Teachers",
            "columns": [
                "teacher_id (PK)",
                "first_name",
                "last_name",
                "email",
                "phone",
                "hire_date",
                "department_id (FK)"
            ]
        },
        {
            "id": "courses",
            "label": "Courses",
            "columns": [
                "course_id (PK)",
                "name",
                "credits",
                "department_id (FK)"
            ]
        },
        {
            "id": "classrooms",
            "label": "Classrooms",
            "columns": [
                "classroom_id (PK)",
                "room_number",
                "building",
                "capacity"
            ]
        },
        {
            "id": "course_schedule",
            "label": "Course Schedule",
            "columns": [
                "schedule_id (PK)",
                "course_id (FK)",
                "teacher_id (FK)",
                "classroom_id (FK)",
                "day_of_week",
                "start_time",
                "end_time"
            ]
        },
        {
            "id": "enrollments",
            "label": "Enrollments",
            "columns": [
                "enrollment_id (PK)",
                "student_id (FK)",
                "course_id (FK)",
                "grade"
            ]
        },
        {
            "id": "attendance",
            "label": "Attendance",
            "columns": [
                "attendance_id (PK)",
                "student_id (FK)",
                "schedule_id (FK)",
                "date",
                "status"
            ]
        },
        {
            "id": "clubs",
            "label": "Clubs",
            "columns": [
                "club_id (PK)",
                "name",
                "faculty_advisor (FK:teachers)"
            ]
        },
        {
            "id": "club_members",
            "label": "Club Members",
            "columns": [
                "club_member_id (PK)",
                "club_id (FK)",
                "student_id (FK)",
                "join_date"
            ]
        }
    ],
    "edges": [
        {"source": "students", "target": "departments"},
        {"source": "students", "target": "enrollments"},
        {"source": "students", "target": "attendance"},
        {"source": "teachers", "target": "departments"},
        {"source": "teachers", "target": "course_schedule"},
        {"source": "courses", "target": "departments"},
        {"source": "courses", "target": "course_schedule"},
        {"source": "courses", "target": "enrollments"},
        {"source": "classrooms", "target": "course_schedule"},
        {"source": "course_schedule", "target": "attendance"},
        {"source": "clubs", "target": "club_members"},
        {"source": "students", "target": "club_members"}
    ]
}


@router.get("/sample")
def get_sample():
    return {"status": "ok", "schema": SAMPLE_SCHEMA}
