from flask import Flask, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Flask API is running',
        'status': 'success'
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

# Add your data science routes here
@app.route('/data')
def data_example():
    # Example using pandas
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    return jsonify({
        'data': df.to_dict(),
        'numpy_version': np.__version__,
        'pandas_version': pd.__version__
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)