import Database from 'better-sqlite3';
import { hashSync } from 'bcryptjs';

const DEFAULT_AGREEMENT = `ETHICAL USE AND USER LICENSE AGREEMENT

By submitting this form, you acknowledge and agree to the following terms:

1. PURPOSE
This training program is designed strictly for ethical cybersecurity education and authorized vulnerability assessment and penetration testing (VAPT) activities.

2. AUTHORIZED USE ONLY
All techniques, tools, and knowledge gained through this training must only be used:
- Within authorized lab environments provided during the training
- On systems you own or have explicit written permission to test
- In compliance with all applicable local, national, and international laws

3. PROHIBITED ACTIVITIES
You must NOT:
- Test, scan, or exploit any system without explicit authorization
- Use techniques learned to access unauthorized data or systems
- Share exploits, tools, or techniques with unauthorized individuals
- Engage in any activity that could cause harm to individuals, organizations, or infrastructure

4. PERSONAL RESPONSIBILITY
You accept full personal responsibility for any actions you take using the knowledge and skills acquired during this training. The training organizers, instructors, and affiliated organizations bear no liability for any misuse.

5. CONSEQUENCES OF VIOLATION
Violation of this agreement may result in:
- Immediate removal from the training program
- Reporting to relevant authorities
- Legal action as deemed appropriate

6. ACKNOWLEDGMENT
By checking the acceptance box below and submitting this form, you confirm that:
- You have read and understood all terms of this agreement
- You agree to abide by all conditions stated herein
- You understand the legal and ethical implications of VAPT activities`;

export function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agreements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      version    INTEGER NOT NULL UNIQUE,
      title      TEXT NOT NULL DEFAULT 'Ethical Use and User License Agreement',
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_active  INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS custom_fields (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      field_name   TEXT NOT NULL,
      label        TEXT NOT NULL,
      field_type   TEXT NOT NULL DEFAULT 'text',
      placeholder  TEXT,
      is_required  INTEGER NOT NULL DEFAULT 0,
      options      TEXT,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      is_active    INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id                TEXT PRIMARY KEY,
      full_name         TEXT NOT NULL,
      email             TEXT NOT NULL,
      phone             TEXT NOT NULL,
      agreement_version INTEGER NOT NULL,
      accepted          INTEGER NOT NULL DEFAULT 1,
      custom_data       TEXT,
      ip_address        TEXT,
      user_agent        TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      action     TEXT NOT NULL,
      details    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed defaults using helper
  function seedSetting(key: string, value: string) {
    const exists = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    if (!exists) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
  }

  seedSetting('access_key', process.env.DEFAULT_ACCESS_KEY || 'TRAINING-2024');

  const adminHash = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash');
  if (!adminHash) {
    const hash = hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password_hash', hash);
  }

  // Branding defaults
  seedSetting('branding_company_name', 'Your Company');
  seedSetting('branding_logo_url', '');
  seedSetting('branding_tagline', 'Training & Certification');
  seedSetting('branding_page_heading', 'Ethical Use Agreement');
  seedSetting('branding_page_description', 'Please enter the access key provided at the start of your training session to proceed.');
  seedSetting('branding_form_heading', 'Participant Registration');
  seedSetting('branding_form_description', 'Fill in your details and review the ethical use agreement below.');
  seedSetting('branding_primary_color', '#2563eb');

  // Seed default agreement
  const agreementCount = db.prepare('SELECT COUNT(*) as count FROM agreements').get() as { count: number };
  if (agreementCount.count === 0) {
    db.prepare(
      'INSERT INTO agreements (version, title, content, is_active) VALUES (?, ?, ?, ?)'
    ).run(1, 'Ethical Use and User License Agreement', DEFAULT_AGREEMENT, 1);
  }

  // Seed default custom fields
  const fieldCount = db.prepare('SELECT COUNT(*) as count FROM custom_fields').get() as { count: number };
  if (fieldCount.count === 0) {
    const insertField = db.prepare(
      'INSERT INTO custom_fields (field_name, label, field_type, placeholder, is_required, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertField.run('organization', 'Organization / Company', 'text', 'Enter your organization name', 0, 1);
    insertField.run('role', 'Role / Designation', 'text', 'Enter your role', 0, 2);
    insertField.run('batch_id', 'Batch / Session ID', 'text', 'Enter your batch or session ID', 0, 3);
  }
}
