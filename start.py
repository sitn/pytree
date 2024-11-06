import os
from flask_cors import CORS
from pytree import start_app
from waitress import serve
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')
app = start_app(os.getenv('CONFIG_FILE'), os.getenv('CPOTREE_EXE'))

if os.getenv('DEPLOY_ENV') == 'PROD' :
    print("Starting pytree in production...")
    serve(app, host=host, port=port, threads=8)
else:
    print("Starting pytree in development...")
    CORS(app)
    app.run(debug=True, host=host, port=port)
