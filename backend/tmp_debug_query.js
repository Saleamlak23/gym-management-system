import 'dotenv/config';
import { query } from './src/config/db.js';

(async () => {
  try {
    const q = `SELECT b.branch_id, b.name, COUNT(DISTINCT s.member_id) FILTER (WHERE s.status = 'active' AND s.end_date >= CURRENT_DATE)::int AS active_subscriptions, COUNT(DISTINCT a.attendance_id) FILTER (WHERE a.check_in::date = CURRENT_DATE)::int AS today_checkins FROM branches b LEFT JOIN subscriptions s ON s.member_id IS NOT NULL LEFT JOIN attendance a ON a.branch_id = b.branch_id GROUP BY b.branch_id, b.name ORDER BY b.name ASC`;
    const res = await query(q);
    console.log('overview branch rows:', JSON.stringify(res.rows, null, 2));
    const nowRes = await query('SELECT CURRENT_DATE as today');
    console.log('today:', nowRes.rows[0].today);
    const activeRes = await query("SELECT COUNT(*)::int AS total FROM subscriptions WHERE status='active' AND end_date >= CURRENT_DATE");
    console.log('active subscriptions total:', activeRes.rows[0].total);
    const membersRes = await query('SELECT COUNT(*)::int AS total FROM members WHERE is_active = true');
    console.log('active members total:', membersRes.rows[0].total);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
