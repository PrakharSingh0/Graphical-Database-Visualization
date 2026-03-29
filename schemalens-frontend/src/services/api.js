export const analyzeSchema = async (id) => {
  const res = await fetch(`/api/analyze/${id}`);
  return res.json();
};