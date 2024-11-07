import os, sys, subprocess
from flask_cors import CORS
from pytree import start_app
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')
app = start_app(os.getenv('CONFIG_FILE'), os.getenv('CPOTREE_EXE'))

if os.getenv('DEPLOY_ENV') == 'PROD' :
    if os.name == 'nt':
        print("Staring in production is not supported on Windows")
        sys.exit()
    print("Starting pytree in production...")
    subprocess.Popen(
        ["gunicorn","--workers=4",f"pytree:start_app('{os.getenv('CONFIG_FILE')}','{os.getenv('CPOTREE_EXE')}')"], 
        stdout=subprocess.PIPE
    ).communicate()
else:
    print("Starting pytree in development...")
    CORS(app)
    app.run(debug=True, host=host, port=port)
