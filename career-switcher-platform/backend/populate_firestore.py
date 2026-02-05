"""
Populate Firestore with dummy data for teacher dashboard
Run this once to fill the database with realistic session data
"""
import firestore_service as fs
from dummy_data_generator import generate_dummy_sessions

def populate_database():
    """
    Populate Firestore with 50 dummy sessions for video 'vid001'
    """
    print("[*] Starting Firestore population...")

    # Generate 50 realistic sessions
    video_id = "vid001"
    sessions = generate_dummy_sessions(video_id, num_sessions=50)

    print(f"[*] Generated {len(sessions)} dummy sessions")

    # Save each session to Firestore
    saved_count = 0
    feedback_count = 0

    for session in sessions:
        # Save the session
        if fs.save_session(session):
            saved_count += 1

            # Save feedback if present
            if session.get("feedback"):
                feedback_data = {
                    "session_id": session["session_id"],
                    "video_id": video_id,
                    "student_id": session["student_id"],
                    "stars": session["feedback"]["stars"],
                    "review": session["feedback"].get("review", ""),
                    "watch_time_seconds": session["watch_time_seconds"],
                    "amount_charged": session["amount_charged"],
                    "submitted_at": session["feedback"]["submitted_at"]
                }
                if fs.save_feedback(feedback_data):
                    feedback_count += 1

    print(f"[+] Successfully saved {saved_count} sessions")
    print(f"[+] Successfully saved {feedback_count} feedback entries")
    print("[+] Firestore population complete!")

    # Verify the data
    print("\n[*] Verifying data...")
    analytics = fs.get_video_analytics(video_id)
    print(f"    Total sessions: {analytics['total_sessions']}")
    print(f"    Total earnings: ${analytics['total_earnings']:.2f}")
    print(f"    Average rating: {analytics['avg_rating']:.2f}")
    print(f"    Total feedback: {analytics['total_feedback']}")

if __name__ == "__main__":
    populate_database()
