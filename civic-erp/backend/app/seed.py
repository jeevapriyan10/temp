"""Seed script — populates the database with demo data.

Run with:  python -m app.seed
"""

import asyncio
from sqlalchemy import select
from app.core.db import engine, Base, AsyncSessionLocal
from app.core.security import hash_password

# Import all models so metadata is complete
from app.models.organization import Organization
from app.models.location import Location
from app.models.department import Department
from app.models.service import Service
from app.models.role import Role
from app.models.user import User


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Role))
        if result.scalars().first():
            print("Database already seeded. Skipping.")
            return

        # ── Roles ──────────────────────────────────────────
        role_defs = [
            ("super_admin", ["*"]),
            ("org_admin", ["org:read", "org:write", "dept:read", "dept:write", "user:read", "user:write", "service:read", "service:write", "location:read", "location:write", "role:read"]),
            ("department_head", ["dept:read", "dept:write", "service:read", "service:write", "user:read", "location:read"]),
            ("department_manager", ["dept:read", "service:read", "service:write", "user:read", "location:read"]),
            ("officer", ["dept:read", "service:read", "location:read"]),
            ("supervisor", ["dept:read", "service:read", "user:read", "location:read"]),
            ("citizen", ["service:read", "dept:read"]),
            ("guest", ["service:read"]),
            ("auditor", ["org:read", "dept:read", "service:read", "user:read", "location:read", "role:read"]),
        ]
        roles = {}
        for name, perms in role_defs:
            r = Role(name=name, permissions=perms)
            session.add(r)
            roles[name] = r
        await session.flush()

        # ── Organization ───────────────────────────────────
        org = Organization(
            name="Chennai Corporation",
            type="government",
            country="India",
            state="Tamil Nadu",
            city="Chennai",
            address="Ripon Building, Chennai 600003",
            timezone="Asia/Kolkata",
            language="en",
        )
        session.add(org)
        await session.flush()

        # ── Locations (Zone 1 > Ward 5 > Anna Street) ─────
        zone = Location(org_id=org.id, name="Zone 1", type="zone")
        session.add(zone)
        await session.flush()

        ward = Location(org_id=org.id, name="Ward 5", type="area", parent_location_id=zone.id)
        session.add(ward)
        await session.flush()

        street = Location(org_id=org.id, name="Anna Street", type="region", parent_location_id=ward.id)
        session.add(street)
        await session.flush()

        # ── Departments & Services ─────────────────────────
        dept_service_map = {
            "Road & Infrastructure": {
                "icon": "🛣️",
                "color": "#EF4444",
                "desc": "Road construction, repair, and infrastructure maintenance",
                "hours": "08:00-18:00",
                "esc": 120,
                "services": [
                    ("Pothole Repair", "Report and fix potholes on public roads", "high"),
                    ("Road Resurfacing", "Request road resurfacing in your area", "medium"),
                    ("Street Light Repair", "Report broken or non-functional street lights", "medium"),
                    ("Footpath Repair", "Request repairs for damaged footpaths", "low"),
                ],
            },
            "Water Supply": {
                "icon": "💧",
                "color": "#3B82F6",
                "desc": "Water supply management and complaint resolution",
                "hours": "06:00-22:00",
                "esc": 60,
                "services": [
                    ("New Water Connection", "Apply for a new water supply connection", "medium"),
                    ("Water Leakage", "Report water pipeline leakage", "high"),
                    ("Low Pressure Complaint", "Report low water pressure issues", "medium"),
                ],
            },
            "Electricity": {
                "icon": "⚡",
                "color": "#F59E0B",
                "desc": "Electrical infrastructure and power supply management",
                "hours": "24/7",
                "esc": 30,
                "services": [
                    ("Power Outage", "Report power outage in your area", "critical"),
                    ("New Connection", "Apply for new electricity connection", "medium"),
                    ("Transformer Issue", "Report transformer failure or sparking", "high"),
                ],
            },
            "Garbage & Sanitation": {
                "icon": "🗑️",
                "color": "#10B981",
                "desc": "Waste collection, disposal, and sanitation services",
                "hours": "05:00-14:00",
                "esc": 240,
                "services": [
                    ("Missed Pickup", "Report missed garbage collection", "high"),
                    ("Bulk Waste Removal", "Request removal of bulk/construction waste", "medium"),
                    ("Drain Cleaning", "Request cleaning of blocked drains", "high"),
                    ("Public Toilet Maintenance", "Report issues with public toilet facilities", "medium"),
                ],
            },
            "Parks & Recreation": {
                "icon": "🌳",
                "color": "#8B5CF6",
                "desc": "Maintenance and development of parks and public spaces",
                "hours": "06:00-18:00",
                "esc": 480,
                "services": [
                    ("Tree Trimming", "Request trimming of overgrown trees", "low"),
                    ("Park Equipment Repair", "Report broken equipment in parks", "medium"),
                    ("New Park Request", "Request development of new park facilities", "low"),
                ],
            },
        }

        departments = {}
        for dept_name, info in dept_service_map.items():
            dept = Department(
                org_id=org.id,
                name=dept_name,
                icon=info["icon"],
                color=info["color"],
                description=info["desc"],
                working_hours=info["hours"],
                escalation_time_minutes=info["esc"],
                location_id=zone.id,
            )
            session.add(dept)
            await session.flush()
            departments[dept_name] = dept

            for svc_name, svc_desc, priority in info["services"]:
                session.add(
                    Service(
                        department_id=dept.id,
                        name=svc_name,
                        description=svc_desc,
                        default_priority=priority,
                    )
                )
        await session.flush()

        # ── Demo Users (one per role) ──────────────────────
        pw = hash_password("demo1234")
        first_dept = departments["Road & Infrastructure"]
        user_defs = [
            ("Super Admin", "super_admin@demo.com", "super_admin", None),
            ("Org Admin", "org_admin@demo.com", "org_admin", None),
            ("Dept Head", "department_head@demo.com", "department_head", first_dept.id),
            ("Dept Manager", "department_manager@demo.com", "department_manager", first_dept.id),
            ("Officer One", "officer@demo.com", "officer", first_dept.id),
            ("Supervisor One", "supervisor@demo.com", "supervisor", first_dept.id),
            ("Citizen User", "citizen@demo.com", "citizen", None),
            ("Guest User", "guest@demo.com", "guest", None),
            ("Auditor User", "auditor@demo.com", "auditor", None),
        ]
        for uname, email, role_name, dept_id in user_defs:
            session.add(
                User(
                    org_id=org.id,
                    name=uname,
                    email=email,
                    password_hash=pw,
                    role_id=roles[role_name].id,
                    department_id=dept_id,
                    working_area_location_id=zone.id if dept_id else None,
                )
            )

        # ── Notification Rules ─────────────────────────────
        from app.models.notification import NotificationRule
        from app.models.inventory import InventoryItem

        rules_defs = [
            ("complaint_created", "department_head", "New complaint logged in your department"),
            ("complaint_assigned", "officer", "You have been assigned a new complaint"),
            ("status_changed", "citizen", "Your complaint status has been updated"),
            ("escalated", "org_admin", "High priority complaint requires attention"),
        ]
        for event, rname, template in rules_defs:
            session.add(NotificationRule(
                org_id=org.id,
                trigger_event=event,
                notify_role=rname,
                template_text=template,
            ))

        # ── Inventory Items ────────────────────────────────
        inv_map = {
            "Road & Infrastructure": [
                ("Asphalt Cold Mix", 150, "bags"),
                ("Traffic Cones", 50, "units"),
                ("Pothole Compactor", 4, "units"),
            ],
            "Water Supply": [
                ("PVC Pipes 4-inch", 200, "meters"),
                ("Gate Valves 2-inch", 45, "units"),
                ("Leak Repair Clamps", 100, "units"),
            ],
            "Electricity": [
                ("LED Streetlight Heads 100W", 60, "units"),
                ("Insulated Safety Gloves", 25, "pairs"),
                ("Copper Armored Cable", 300, "meters"),
            ],
            "Garbage & Sanitation": [
                ("Wheelie Dustbins 240L", 80, "units"),
                ("Sanitation Sprayers", 15, "units"),
                ("Disinfectant Chemical", 500, "liters"),
            ],
        }

        for dept_name, items in inv_map.items():
            if dept_name in departments:
                dept_obj = departments[dept_name]
                for iname, qty, uunit in items:
                    session.add(InventoryItem(
                        department_id=dept_obj.id,
                        name=iname,
                        quantity=qty,
                        unit=uunit,
                    ))

        await session.commit()
        print("[OK] Seed complete - 1 org, 3 locations, 5 departments, 17 services, 9 roles, 9 users, notification rules & inventory items")


if __name__ == "__main__":
    asyncio.run(seed())
