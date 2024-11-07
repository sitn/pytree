import os, sys, subprocess
from flask_cors import CORS
from pytree import start_app
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')

if os.getenv('DEPLOY_ENV') == 'PROD' :
    if os.name == 'nt':
        print("Staring in production is not supported on Windows")
        sys.exit()
    print("Starting pytree in production...")
    subprocess.Popen(
        ["gunicorn",
         "--workers=4",
         f"pytree:start_app('{os.getenv('CONFIG_FILE')}','{os.getenv('CPOTREE_EXE')}','{os.getenv('DATA_DIR')}')"], 
        stdout=subprocess.PIPE
    ).communicate()
else:
    print("Starting pytree in development...")
    app = start_app(os.getenv('CONFIG_FILE'), os.getenv('CPOTREE_EXE'), os.getenv('DATA_DIR'))
    CORS(app, resources={r"/*":{"origins":"*"}})
    app.run(debug=True, host=host, port=port)
