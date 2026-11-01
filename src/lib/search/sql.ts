// Expressions are shared by the index DDL and the search queries so Postgres can use the GIN indexes.
export const SEARCH_VECTORS = {
  note: `to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", '') || ' ' || coalesce("tags", ''))`,
  subject: `to_tsvector('english', coalesce("name", '') || ' ' || coalesce("code", '') || ' ' || coalesce("description", ''))`,
  video: `to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", ''))`,
  quiz: `to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", ''))`,
  question: `to_tsvector('english', coalesce("questionText", '') || ' ' || coalesce("topicTag", ''))`,
  doubt: `to_tsvector('english', coalesce("title", '') || ' ' || coalesce("content", '') || ' ' || coalesce("tags", ''))`,
} as const;

export const SEARCH_INDEX_SQL = [
  `CREATE INDEX IF NOT EXISTS note_fts_idx ON "Note" USING gin ((${SEARCH_VECTORS.note}))`,
  `CREATE INDEX IF NOT EXISTS subject_fts_idx ON "Subject" USING gin ((${SEARCH_VECTORS.subject}))`,
  `CREATE INDEX IF NOT EXISTS video_fts_idx ON "VideoLecture" USING gin ((${SEARCH_VECTORS.video}))`,
  `CREATE INDEX IF NOT EXISTS quiz_fts_idx ON "Quiz" USING gin ((${SEARCH_VECTORS.quiz}))`,
  `CREATE INDEX IF NOT EXISTS question_fts_idx ON "QuestionBank" USING gin ((${SEARCH_VECTORS.question}))`,
  `CREATE INDEX IF NOT EXISTS doubt_fts_idx ON "DoubtPost" USING gin ((${SEARCH_VECTORS.doubt}))`,
  `CREATE INDEX IF NOT EXISTS note_title_trgm_idx ON "Note" USING gin ("title" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS subject_name_trgm_idx ON "Subject" USING gin ("name" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS video_title_trgm_idx ON "VideoLecture" USING gin ("title" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS quiz_title_trgm_idx ON "Quiz" USING gin ("title" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS content_chunk_embedding_idx ON "ContentChunk" USING hnsw ("embedding" vector_cosine_ops)`,
];
