CREATE DATABASE IF NOT EXISTS online_bookstore;
USE online_bookstore;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  is_admin TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  price DECIMAL(8,2),
  cover VARCHAR(255),
  description TEXT,
  stock INT DEFAULT 0
);

INSERT INTO books (title, author, price, cover, description, stock) VALUES
('The Great Gatsby','F. Scott Fitzgerald',199.00,'/covers/gatsby.jpg','Classic novel set in the Jazz Age.', 10),
('1984','George Orwell',249.00,'/covers/1984.jpg','Dystopian novel about totalitarianism.', 8),
('Clean Code','Robert C. Martin',799.00,'/covers/cleancode.jpg','A Handbook of Agile Software Craftsmanship.', 6),
('To Kill a Mockingbird','Harper Lee',299.00,'/covers/mockingbird.jpg','A novel about racial injustice and moral growth.', 7),
('The Pragmatic Programmer','Andrew Hunt, David Thomas',999.00,'/covers/pragprog.jpg','Classic book on pragmatic software development practices.', 5),
('Sapiens','Yuval Noah Harari',599.00,'/covers/sapiens.jpg','A brief history of humankind.', 9);
