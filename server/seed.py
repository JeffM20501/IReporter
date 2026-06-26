# server/seed.py
from server.app import create_app
from server.config import db
from server.models import User
from sqlalchemy import text

def seed_users():
    """Create admin user only."""
    print("Seeding admin user...")
    
    admin = User.query.filter_by(email="admin@ireporter.com").first()
    if admin:
        print("Admin user already exists.")
        return admin
    
    admin = User(
        username="admin",
        email="admin@ireporter.com",
        password="Admin@ireporter",
        is_admin=True
    )
    db.session.add(admin)
    db.session.commit()
    print("Admin user created.")
    return admin

def seed_all():
    """Main seeding function."""
    app = create_app()
    with app.app_context():
        #reset schema
        with db.engine.connect() as conn:
            conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
            conn.commit()
        db.create_all()
        
        admin = seed_users()
        print(f"✅ Seeding completed! Admin user: {admin.email}")

if __name__ == "__main__":
    seed_all()