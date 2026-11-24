import sys
import uvicorn
from app.core.config import settings

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

if __name__ == "__main__":
    print(f"[GroupFare] Launching Backend (Team {settings.TEAM_NAME} - ID: {settings.TEAM_ID})...")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
