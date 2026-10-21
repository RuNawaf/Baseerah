export function health(req, res) {
  res.json({ status: 'ok', service: 'baseerah-api', time: new Date().toISOString() });
}
