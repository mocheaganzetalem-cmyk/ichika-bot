const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class Database {
  constructor() {
    this.dbPath = config.database.path;
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.dbPath,
      path.join(this.dbPath, 'users'),
      path.join(this.dbPath, 'groups'),
      path.join(this.dbPath, 'ai'),
      path.join(this.dbPath, 'economy'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generic read function
  read(category, id) {
    try {
      const filePath = path.join(this.dbPath, category, `${id}.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error reading ${category}/${id}:`, error);
      return null;
    }
  }

  // Generic write function
  write(category, id, data) {
    try {
      const filePath = path.join(this.dbPath, category, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${category}/${id}:`, error);
      return false;
    }
  }

  // Generic update function (merge with existing)
  update(category, id, data) {
    try {
      const existing = this.read(category, id) || {};
      const merged = { ...existing, ...data };
      return this.write(category, id, merged);
    } catch (error) {
      console.error(`Error updating ${category}/${id}:`, error);
      return false;
    }
  }

  // Generic delete function
  delete(category, id) {
    try {
      const filePath = path.join(this.dbPath, category, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting ${category}/${id}:`, error);
      return false;
    }
  }

  // List all files in a category
  list(category) {
    try {
      const dirPath = path.join(this.dbPath, category);
      if (!fs.existsSync(dirPath)) return [];
      
      return fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error(`Error listing ${category}:`, error);
      return [];
    }
  }
}

module.exports = new Database();
