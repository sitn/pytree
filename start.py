import os, sys
from flask_cors import CORS
from pytree import start_app
from dotenv import load_dotenv
from subprocess import run
load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')
app = start_app(os.getenv('CONFIG_FILE'), os.getenv('CPOTREE_EXE'))

if os.getenv('DEPLOY_ENV') == 'PROD' :
    if os.name == 'nt':
        print("Staring in production is not supported on Windows")
        sys.exit()
    print("Starting pytree in production...")
    run("gunicorn -workers=4 pytree:start_app()")
else:
    print("Starting pytree in development...")
    CORS(app)
    app.run(debug=True, host=host, port=port)
