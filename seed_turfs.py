import os
import sys
from datetime import date, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

import mongoengine as me
from config import Config
me.connect(host=Config.MONGODB_URI, db="turfx", alias="default", uuidRepresentation="standard")

from models import Turf, TurfSlot

turfs_catalog = [
    {
        "id": 1,
        "name": "TurfX Arena",
        "address": "12, 2nd Avenue, Anna Nagar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "base_price": 800.0,
        "owner_id": 1,
        "description": "Premium cricket and multi-sport turf with high-quality artificial grass, LED floodlights, and changing rooms.",
        "facilities": "Night Lights, Changing Room, Parking, Drinking Water",
        "contact_phone": "+91 98765 43210",
        "contact_email": "arena@turfx.com",
        "status": "active"
    },
    {
        "id": 2,
        "name": "Champions Turf",
        "address": "45, GST Road, Tambaram",
        "city": "Tambaram",
        "state": "Tamil Nadu",
        "base_price": 700.0,
        "owner_id": 1,
        "description": "Spacious outdoor cricket turf with dedicated bowling run-ups, practice nets, and floodlights.",
        "facilities": "Flood Lights, Practice Nets, Parking",
        "contact_phone": "+91 98765 43211",
        "contact_email": "champions@turfx.com",
        "status": "active"
    },
    {
        "id": 3,
        "name": "City Sports Arena",
        "address": "88, Bypass Road, Velachery",
        "city": "Velachery",
        "state": "Tamil Nadu",
        "base_price": 900.0,
        "owner_id": 1,
        "description": "FIFA-standard 5-a-side football and cricket turf arena with premium shock-absorbent turf.",
        "facilities": "5-a-side, Night Lights, Shower, Lockers",
        "contact_phone": "+91 98765 43212",
        "contact_email": "citysports@turfx.com",
        "status": "active"
    },
    {
        "id": 4,
        "name": "Super Strikers Ground",
        "address": "15, Usman Road, T Nagar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "base_price": 750.0,
        "owner_id": 1,
        "description": "Top-rated cricket ground with tournament-grade turf and high-mast floodlights.",
        "facilities": "Cricket Nets, Lights, Parking",
        "contact_phone": "+91 98765 43213",
        "contact_email": "strikers@turfx.com",
        "status": "active"
    },
    {
        "id": 5,
        "name": "Elite Cricket Club",
        "address": "102, 100 Feet Road, Velachery",
        "city": "Velachery",
        "state": "Tamil Nadu",
        "base_price": 1200.0,
        "owner_id": 1,
        "description": "Premium indoor and outdoor cricket facility equipped with bowling machines and HD cameras.",
        "facilities": "Pro Turf, Cameras, Shower, Bowling Machine",
        "contact_phone": "+91 98765 43214",
        "contact_email": "elite@turfx.com",
        "status": "active"
    },
    {
        "id": 6,
        "name": "KickOff Arena",
        "address": "34, Mudichur Road, Tambaram",
        "city": "Tambaram",
        "state": "Tamil Nadu",
        "base_price": 850.0,
        "owner_id": 1,
        "description": "7-a-side football and box cricket arena with international turf grass and cafe.",
        "facilities": "7-a-side, Lights, Parking, Cafe",
        "contact_phone": "+91 98765 43215",
        "contact_email": "kickoff@turfx.com",
        "status": "active"
    }
]

# Standard slot templates (slot_id, start_time, end_time, price)
default_slots = [
    (1, "06:00 AM", "07:00 AM", 500.0),
    (2, "07:00 AM", "08:00 AM", 500.0),
    (3, "08:00 AM", "09:00 AM", 600.0),
    (4, "09:00 AM", "10:00 AM", 700.0),
    (5, "05:00 PM", "06:00 PM", 1000.0),
    (6, "06:00 PM", "07:00 PM", 1000.0),
    (7, "07:00 PM", "08:00 PM", 1200.0),
    (9, "09:00 PM", "10:00 PM", 1200.0),
    (10, "10:00 PM", "11:00 PM", 900.0),
]

print("=== Seeding Turfs into MongoDB Atlas ===")
for data in turfs_catalog:
    t = Turf.objects(id=data["id"]).first()
    if not t:
        t = Turf(**data).save()
        print(f"Created Turf ID {t.id}: {t.name}")
    else:
        for k, v in data.items():
            setattr(t, k, v)
        t.save()
        print(f"Updated Turf ID {t.id}: {t.name}")

# Sync sequence counters for turf.id
from pymongo import MongoClient
client = MongoClient(Config.MONGODB_URI)
client["turfx"]["mongoengine.counters"].update_one(
    {"_id": "turf.id"},
    {"$max": {"next": 6}},
    upsert=True
)

print("\n=== Seeding Slots for Next 14 Days ===")
today = date.today()
total_slots_created = 0

for day_offset in range(15):
    slot_date = today + timedelta(days=day_offset)
    for turf_data in turfs_catalog:
        t_id = turf_data["id"]
        for slot_item in default_slots:
            s_id, s_start, s_end, s_price = slot_item
            # Check if slot already exists for this turf, date, and start time
            existing_slot = TurfSlot.objects(turf_id=t_id, slot_date=slot_date, start_time=s_start).first()
            if not existing_slot:
                TurfSlot(
                    turf_id=t_id,
                    slot_date=slot_date,
                    start_time=s_start,
                    end_time=s_end,
                    price=s_price,
                    status="available"
                ).save()
                total_slots_created += 1

print(f"Created {total_slots_created} available slots across all 6 turfs for the next 14 days!")
print("Turf and slot seeding completed successfully!")
