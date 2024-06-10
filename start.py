import os
from flask_cors import CORS
from pytree import app, config
from waitress import serve
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')

if os.getenv('DEPLOY_ENV') == 'PROD' :
    print("Starting pytree in production...")
    app.config['DEBUG'] = False
    serve(app, host=host, port=port, threads=8)

else:
    print("Starting pytree in development...")
    if config['vars']['debug']:
        CORS(app)
        app.run(debug=True, host=host, port=port)
    else:
        app.run()
