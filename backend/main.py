# backend/main.py - FINAL VERIFIED VERSION
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from crossword_logic import generate_crossword, generate_clues
import spacy
import fitz

app = FastAPI()

origins = ["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

nlp = spacy.load("en_core_web_sm")

def extract_keywords_from_text(text: str) -> list:
    doc = nlp(text)
    keywords = set(token.lemma_.lower() for token in doc if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct and len(token.lemma_) > 3)
    return sorted(list(keywords))

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    try:
        file_content = await file.read()
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        extracted_text = "\n".join(pdf_document.load_page(i).get_text() for i in range(pdf_document.page_count))
        pdf_document.close()
        
        keywords_list = extract_keywords_from_text(extracted_text)
        grid, placed_words = generate_crossword(keywords_list)
        word_strings_for_clues = [word_obj.word for word_obj in placed_words]
        clues = generate_clues(extracted_text, word_strings_for_clues)

        return {"grid": grid, "placed_words": [word.__dict__ for word in placed_words], "clues": clues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "Backend is running"}
