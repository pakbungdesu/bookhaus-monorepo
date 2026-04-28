from urllib.parse import unquote

from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

# Load model and data once at startup
model_knn = joblib.load('model_knn.pkl')
book_features_df = pd.read_pickle('book_features_df.pkl')
top_books = pd.read_pickle("top_books.pkl")

@app.get("/recommend/{book_title}")
def get_recommendations(book_title: str):
    # 1. Check if the book exists in your dataset
    print(f"Received request for: '{book_title}'")
    
    decoded_title = unquote(book_title)
    
    # Debug print the title being looked up
    print(f"DEBUG: Looking up book: '{decoded_title}'")
    
    print(f"DEBUG: Index type: {type(book_features_df.index)}")
    print(f"DEBUG: First 20 items in index: {book_features_df.index[:20].tolist()}")
    
    if decoded_title not in book_features_df.index:
        return {
            "book": decoded_title,
            "message": "No direct recommendations, showing popular books instead",
            "recommendations": top_books.to_dict(orient='records')
        }

    # 2. Get the row index for the input book
    query_index = book_features_df.index.get_loc(decoded_title)
    
    # 3. Use the model to find neighbors
    # We ask for 6 neighbors because the first one is the book itself
    distances, indices = model_knn.kneighbors(
        book_features_df.iloc[query_index, :].values.reshape(1, -1), 
        n_neighbors=6
    )

    # 4. Format the output
    recommendations = []
    for i in range(1, len(distances.flatten())):
        rec_title = book_features_df.index[indices.flatten()[i]]
        recommendations.append({
            "title": rec_title,
            "distance": float(distances.flatten()[i])
        })

    return {"book": decoded_title, "recommendations": recommendations}