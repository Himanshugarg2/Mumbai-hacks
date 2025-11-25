# this file will handle all Firestore interactions  POST / GET / UPDATE / DELETE4


import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


def add_dream(user_id, data):
    return db.collection("users").document(user_id).collection("dreams").add(data)


# Get all dreams for a user
def get_dreams(user_id):
    docs = db.collection("users").document(user_id).collection("dreams").stream()

    dreams = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id  # include doc ID for updates/deletes
        dreams.append(item)

    return dreams


# Update dream progress (e.g., saved_amount)
def update_dream(user_id, dream_id, data):
    return (
        db.collection("users")
        .document(user_id)
        .collection("dreams")
        .document(dream_id)
        .update(data)
    )


# Delete a dream
def delete_dream(user_id, dream_id):
    return (
        db.collection("users")
        .document(user_id)
        .collection("dreams")
        .document(dream_id)
        .delete()
    )
