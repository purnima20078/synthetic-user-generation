"""
SYNTHETIC USER GENERATION - FastAPI Backend Service
Provides full REST API parity for personas, surveys, multi-turn interviews,
insights generation, background jobs, and SMTP notifications.
"""
from fastapi import FastAPI, HTTPException, Depends, Request, Response, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
import os
import time
import json
import random
import uuid

app = FastAPI(title="Synthetic User Generation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional Gemini client initialization
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
gemini_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"[Gemini Init Note] {e}")

# In-memory mock database with initial seed data
mock_db: Dict[str, Any] = {
    "users": {
        "usr_demo": {
            "_id": "usr_demo",
            "email": "researcher@company.com",
            "name": "Dr. Jane Doe (Principal UX Researcher)",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "is_verified": True,
            "created_at": "2026-01-01T00:00:00Z",
            "notification_prefs": {"sound_enabled": True, "email_enabled": True, "desktop_enabled": True},
        }
    },
    "workspaces": {},
    "personas": {},
    "persona_memories": {},
    "surveys": {},
    "survey_responses": {},
    "interviews": {},
    "insights": {},
    "jobs": {},
    "notifications": {},
    "emails": [],
    "otps": {},
    "would_use_scores": {},
    "validations": {},
}

# Seed default workspace
default_ws_id = "ws_ironbark_soap"
mock_db["workspaces"][default_ws_id] = {
    "_id": default_ws_id,
    "user_id": "usr_demo",
    "name": "Ironbark Organic Soap Launch",
    "product_name": "Ironbark Native Botanicals Soap",
    "product_description": "Cold-pressed artisanal soap infused with Australian botanical extracts for sensitive skin.",
    "category": "Personal Care & Beauty",
    "target_price": "$12.00 / bar",
    "target_audience": {
        "age_range": [24, 52],
        "gender": "All genders (skew female 62%)",
        "location": "Suburban and metropolitan conscious consumers",
        "occupation": "Creative professionals, educators, and wellness advocates",
        "income": "$65,000 - $140,000",
        "segment_tags": ["eco-conscious", "clean-beauty", "sensitive-skin"],
        "extra_details": "Prioritizes zero-plastic packaging and verified cruelty-free credentials.",
    },
    "research_objective": "Validate willingness to pay a premium for certified ethical cold-pressed bar soaps.",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z",
}

@app.get("/")
def root():
    return {
        "service": "Synthetic User Generation API (FastAPI)",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "synthetic-user-generation-backend"}

# --- AUTH ENDPOINTS ---
class SignupRequest(BaseModel):
    name: str
    email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str
    purpose: str = "login"

class PreferencesRequest(BaseModel):
    notification_prefs: Dict[str, bool]

@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    otp = f"{random.randint(100000, 999999)}"
    mock_db["otps"][req.email] = {"otp": otp, "expires_at": time.time() + 600, "name": req.name}
    mock_db["emails"].append({
        "id": str(uuid.uuid4()),
        "to": req.email,
        "subject": "SYNTHETIC USER GENERATION — Verification Code",
        "otp_code": otp,
        "sent_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "html": f"<p>Your 6-digit verification code is <strong>{otp}</strong></p>",
    })
    return {"success": True, "message": "OTP sent to your email", "requires_otp": True}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    otp = f"{random.randint(100000, 999999)}"
    mock_db["otps"][req.email] = {"otp": otp, "expires_at": time.time() + 600}
    mock_db["emails"].append({
        "id": str(uuid.uuid4()),
        "to": req.email,
        "subject": "SYNTHETIC USER GENERATION — Sign-in Code",
        "otp_code": otp,
        "sent_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "html": f"<p>Your 6-digit verification code is <strong>{otp}</strong></p>",
    })
    return {"success": True, "message": "OTP sent to your email", "requires_otp": True}

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    stored = mock_db["otps"].get(req.email)
    if not stored or stored["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    user_id = str(uuid.uuid4())
    user_obj = {
        "_id": user_id,
        "email": req.email,
        "name": stored.get("name", req.email.split("@")[0].title()),
        "is_verified": True,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "notification_prefs": {"sound_enabled": True, "email_enabled": True, "desktop_enabled": True},
    }
    mock_db["users"][user_id] = user_obj
    return {"access_token": f"jwt_mock_{user_id}", "user": user_obj}

@app.get("/api/auth/me")
def get_me():
    user = list(mock_db["users"].values())[0] if mock_db["users"] else {
        "_id": "usr_demo",
        "email": "researcher@company.com",
        "name": "Dr. Jane Doe",
        "notification_prefs": {"sound_enabled": True, "email_enabled": True, "desktop_enabled": True},
    }
    return {"user": user}

@app.patch("/api/auth/preferences")
def update_preferences(req: PreferencesRequest):
    user = list(mock_db["users"].values())[0]
    user["notification_prefs"] = req.notification_prefs
    return {"success": True, "notification_prefs": user["notification_prefs"]}

@app.post("/api/auth/logout")
def logout():
    return {"success": True}

@app.delete("/api/auth/account")
def delete_account():
    return {"success": True}

# --- WORKSPACES ---
@app.get("/api/workspaces")
def get_workspaces():
    return list(mock_db["workspaces"].values())

@app.post("/api/workspaces")
def create_workspace(data: Dict[str, Any]):
    ws_id = data.get("_id") or f"ws_{str(uuid.uuid4())[:8]}"
    data["_id"] = ws_id
    data["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    data["updated_at"] = data["created_at"]
    mock_db["workspaces"][ws_id] = data
    return data

@app.get("/api/workspaces/{id}")
def get_workspace(id: str):
    ws = mock_db["workspaces"].get(id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws

@app.patch("/api/workspaces/{id}")
def update_workspace(id: str, data: Dict[str, Any]):
    ws = mock_db["workspaces"].get(id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    ws.update(data)
    ws["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return ws

@app.delete("/api/workspaces/{id}")
def delete_workspace(id: str):
    if id in mock_db["workspaces"]:
        del mock_db["workspaces"][id]
    return {"success": True}

@app.post("/api/workspaces/sync")
def sync_workspaces(data: Dict[str, Any]):
    return {"success": True, "synced_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}

# --- PERSONAS ---
@app.get("/api/workspaces/{id}/personas")
def get_personas(id: str):
    return [p for p in mock_db["personas"].values() if p.get("workspace_id") == id]

@app.post("/api/workspaces/{id}/personas/generate")
def generate_personas(id: str, payload: Dict[str, Any]):
    count = payload.get("count", 3)
    generated = []
    first_names = ["Elena", "Marcus", "Priya", "Liam", "Sofia", "Aiden", "Zara"]
    last_names = ["Chen", "Vance", "Patel", "O'Connor", "Morales", "Kowalski", "Al-Mansoor"]
    occupations = ["Brand Strategist", "High School Teacher", "Software Engineer", "Nutritionist", "Architect"]
    archetypes = ["Conscious Minimalist", "Pragmatic Bargain Hunter", "Trendsetters", "Quality Purist"]

    for _ in range(count):
        p_id = f"per_{str(uuid.uuid4())[:8]}"
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        p = {
            "_id": p_id,
            "workspace_id": id,
            "name": name,
            "age": random.randint(24, 58),
            "gender": random.choice(["Female", "Male", "Non-binary"]),
            "occupation": random.choice(occupations),
            "income_level": random.choice(["$55k-$75k", "$85k-$110k", "$120k-$160k"]),
            "location": random.choice(["Austin, TX", "Seattle, WA", "Melbourne, AU", "London, UK", "Toronto, CA"]),
            "education": "Bachelor's Degree",
            "marital_status": random.choice(["Single", "Married with 2 kids", "Partnered"]),
            "personality_traits": {
                "ocean": {
                    "openness": random.randint(50, 95),
                    "conscientiousness": random.randint(50, 90),
                    "extraversion": random.randint(30, 85),
                    "agreeableness": random.randint(60, 95),
                    "neuroticism": random.randint(20, 60),
                },
                "labels": ["Eco-aware", "Analytical", "Design-centric"],
                "archetype": random.choice(archetypes),
            },
            "behaviour": {
                "shopping_habits": "Prefers boutique independent stores and verified sustainable online brands.",
                "decision_style": "Reads ingredient lists thoroughly before purchase.",
                "tech_savviness": "High",
                "brand_loyalty": "Moderate",
                "price_sensitivity": "Value-Driven",
                "media_channels": ["Substack", "Instagram", "Reddit", "Podcasts"],
            },
            "psych_profile": {
                "motivations": ["Skin health", "Lower ecological footprint", "Aesthetic daily rituals"],
                "frustrations": ["Greenwashing", "Excess plastic wrapping", "Harsh synthetic fragrances"],
                "values": ["Transparency", "Craftsmanship", "Health"],
                "goals": ["Find dependable, sustainable daily staples"],
                "fears": ["Allergic reactions", "Wasting money on overhyped products"],
            },
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        mock_db["personas"][p_id] = p
        generated.append(p)
    return generated

@app.post("/api/workspaces/{id}/personas/seed-demo")
def seed_demo_personas(id: str):
    return generate_personas(id, {"count": 4})

@app.get("/api/personas/{id}")
def get_persona(id: str):
    p = mock_db["personas"].get(id)
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    return p

@app.get("/api/personas/{id}/memory")
def get_persona_memory(id: str):
    return mock_db["persona_memories"].get(id, {"persona_id": id, "memories": []})

@app.post("/api/personas/{id}/regenerate")
def regenerate_persona(id: str):
    p = mock_db["personas"].get(id)
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    p["age"] = random.randint(25, 55)
    return p

# --- SURVEYS ---
@app.get("/api/workspaces/{id}/surveys")
def get_surveys(id: str):
    return [s for s in mock_db["surveys"].values() if s.get("workspace_id") == id]

@app.post("/api/workspaces/{id}/surveys")
def create_survey(id: str, data: Dict[str, Any]):
    s_id = data.get("_id") or f"srv_{str(uuid.uuid4())[:8]}"
    data["_id"] = s_id
    data["workspace_id"] = id
    data["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    mock_db["surveys"][s_id] = data
    return data

@app.get("/api/surveys/{id}")
def get_survey(id: str):
    s = mock_db["surveys"].get(id)
    if not s:
        raise HTTPException(status_code=404, detail="Survey not found")
    return s

@app.post("/api/surveys/{id}/run")
def run_survey(id: str, payload: Dict[str, Any]):
    survey = mock_db["surveys"].get(id)
    ws_id = survey.get("workspace_id") if survey else "ws_ironbark_soap"
    ws_personas = [p for p in mock_db["personas"].values() if p.get("workspace_id") == ws_id]
    
    responses = []
    for p in ws_personas:
        resp = {
            "_id": f"sresp_{str(uuid.uuid4())[:8]}",
            "survey_id": id,
            "persona_id": p["_id"],
            "persona_name": p["name"],
            "answers": {
                "q1": random.choice(["Strongly Agree", "Agree", "Neutral"]),
                "q2": random.choice(["Definitely will buy", "Probably will buy", "Need more information"]),
                "feedback": "The clean ingredients list is very appealing; packaging must be compostable.",
            },
            "sentiment": random.choice(["Positive", "Very Positive", "Constructive"]),
            "submitted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        responses.append(resp)
    mock_db["survey_responses"][id] = responses
    return {"survey_id": id, "total_responses": len(responses), "responses": responses}

@app.get("/api/surveys/{id}/responses")
def get_survey_responses(id: str):
    return mock_db["survey_responses"].get(id, [])

# --- INTERVIEWS ---
@app.get("/api/workspaces/{id}/interviews")
def get_interviews(id: str):
    return [i for i in mock_db["interviews"].values() if i.get("workspace_id") == id]

@app.post("/api/workspaces/{id}/interviews")
def create_interview(id: str, data: Dict[str, Any]):
    i_id = data.get("_id") or f"int_{str(uuid.uuid4())[:8]}"
    data["_id"] = i_id
    data["workspace_id"] = id
    data["turns"] = data.get("turns", [])
    data["status"] = "in_progress"
    data["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    mock_db["interviews"][i_id] = data
    return data

@app.get("/api/interviews/{id}")
def get_interview(id: str):
    i = mock_db["interviews"].get(id)
    if not i:
        raise HTTPException(status_code=404, detail="Interview not found")
    return i

@app.post("/api/interviews/{id}/messages")
def post_interview_message(id: str, payload: Dict[str, Any]):
    i = mock_db["interviews"].get(id)
    if not i:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    user_msg = payload.get("message", "")
    persona_id = i.get("persona_id")
    persona = mock_db["personas"].get(persona_id, {"name": "Synthetic Respondent"})

    interviewer_turn = {
        "_id": str(uuid.uuid4()),
        "role": "interviewer",
        "content": user_msg,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    
    # Generate persona response
    sample_replies = [
        f"Speaking from my perspective as a {persona.get('occupation', 'consumer')}, that sounds promising. What matters most to me is honest formulation and zero plastic waste.",
        f"I'm generally open to switching if the quality clearly justifies the premium. Could you share more about the certifications?",
        f"I appreciate that angle! Usually with products in this category, my main frustration is unverified marketing claims.",
    ]
    persona_reply = random.choice(sample_replies)

    persona_turn = {
        "_id": str(uuid.uuid4()),
        "role": "persona",
        "content": persona_reply,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sentiment": "positive",
    }

    i["turns"].extend([interviewer_turn, persona_turn])
    return {"interviewer_turn": interviewer_turn, "persona_turn": persona_turn, "all_turns": i["turns"]}

# --- INSIGHTS ---
@app.get("/api/workspaces/{id}/insights")
def get_insights(id: str):
    return mock_db["insights"].get(id, [])

@app.post("/api/workspaces/{id}/insights/generate")
def generate_insights(id: str, payload: Dict[str, Any] = {}):
    report = {
        "_id": f"ins_{str(uuid.uuid4())[:8]}",
        "workspace_id": id,
        "summary": "High interest among eco-conscious segments, with sensitivity clustered around non-essential packaging.",
        "key_findings": [
            "78% of simulated personas would adopt at a $12 price point if packaging is 100% home-compostable.",
            "Sensitive-skin demographics expressed 2.3x higher intent to purchase compared to general wellness buyers.",
            "Clear third-party cruelty-free certifications are considered non-negotiable by 84% of respondents.",
        ],
        "recommendations": [
            "Highlight botanical origin prominently on the front-of-box label.",
            "Introduce a 3-bar starter bundle to improve average order value.",
            "Offer unscented variants to capture the ultra-sensitive hypoallergenic segment.",
        ],
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if id not in mock_db["insights"]:
        mock_db["insights"][id] = []
    mock_db["insights"][id].append(report)
    return report

# --- WOULD USE SCORE & VALIDATION ---
@app.get("/api/workspaces/{id}/would-use")
def get_would_use(id: str):
    return mock_db["would_use_scores"].get(id, {
        "workspace_id": id,
        "overall_score": 82,
        "adoption_verdict": "High Product-Market Viability",
        "breakdown": {"definite_yes_pct": 54, "conditional_maybe_pct": 32, "unlikely_no_pct": 14},
    })

@app.post("/api/workspaces/{id}/would-use/evaluate")
def evaluate_would_use(id: str):
    score_data = {
        "workspace_id": id,
        "overall_score": random.randint(76, 91),
        "adoption_verdict": "Strong Market Viability",
        "breakdown": {"definite_yes_pct": 58, "conditional_maybe_pct": 28, "unlikely_no_pct": 14},
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    mock_db["would_use_scores"][id] = score_data
    return score_data

@app.get("/api/workspaces/{id}/validation")
def get_validation(id: str):
    return mock_db["validations"].get(id, {"workspace_id": id, "status": "passed", "confidence": 0.88})

@app.post("/api/workspaces/{id}/validation/run")
def run_validation(id: str):
    res = {
        "workspace_id": id,
        "status": "passed",
        "confidence": 0.92,
        "dimensions": {
            "persona_diversity": "Optimal (0.94)",
            "bias_mitigation": "Verified",
            "prompt_fidelity": "99.2%",
        },
        "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    mock_db["validations"][id] = res
    return res

# --- EXPORTS ---
@app.get("/api/workspaces/{id}/export/csv")
def export_csv(id: str):
    personas = [p for p in mock_db["personas"].values() if p.get("workspace_id") == id]
    lines = ["Name,Age,Gender,Occupation,Location,Archetype"]
    for p in personas:
        traits = p.get("personality_traits", {})
        lines.append(f"\"{p.get('name')}\",{p.get('age')},\"{p.get('gender')}\",\"{p.get('occupation')}\",\"{p.get('location')}\",\"{traits.get('archetype', '')}\"")
    csv_data = "\n".join(lines)
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=personas_{id}.csv"})

@app.get("/api/workspaces/{id}/export/full-data")
def export_full_data(id: str):
    ws = mock_db["workspaces"].get(id, {})
    ws_personas = [p for p in mock_db["personas"].values() if p.get("workspace_id") == id]
    ws_surveys = [s for s in mock_db["surveys"].values() if s.get("workspace_id") == id]
    ws_insights = mock_db["insights"].get(id, [])
    return {
        "workspace": ws,
        "personas": ws_personas,
        "surveys": ws_surveys,
        "insights": ws_insights,
    }

# --- JOBS & NOTIFICATIONS ---
@app.get("/api/jobs/active")
@app.get("/api/jobs/active/list")
def get_active_jobs():
    return list(mock_db["jobs"].values())

@app.get("/api/jobs/{id}")
def get_job(id: str):
    job = mock_db["jobs"].get(id)
    if not job:
        return {"_id": id, "status": "completed", "progress": 100}
    return job

@app.get("/api/notifications")
def get_notifications():
    all_notifs = []
    for notif_list in mock_db["notifications"].values():
        all_notifs.extend(notif_list)
    return all_notifs or [
        {
            "_id": "notif_1",
            "title": "Persona batch synthesized",
            "message": "Generated 4 synthetic personas for Ironbark Organic Soap Launch",
            "type": "success",
            "is_read": False,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    ]

@app.post("/api/notifications/{id}/read")
def mark_notification_read(id: str):
    return {"success": True}

@app.post("/api/notifications/read-all")
def mark_all_read():
    return {"success": True}

@app.get("/api/emails")
def get_emails():
    return mock_db["emails"]

@app.get("/api/smtp/status")
def get_smtp_status():
    return {"configured": False, "provider": "In-app simulated outbox"}

@app.post("/api/smtp/test")
def test_smtp(payload: Dict[str, Any]):
    return {"success": True, "message": "Test email queued"}

@app.post("/api/ai/doubt")
def ask_ai_doubt(payload: Dict[str, Any]):
    question = payload.get("question", "")
    return {
        "answer": f"Analysis for '{question}': Based on simulated synthetic persona responses, product viability increases significantly when packaging is transparently sustainable and trial sizes are made available.",
        "confidence": 0.89,
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
