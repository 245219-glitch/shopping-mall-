-- Coco's Mall - FSD Lab 05
-- Import in XAMPP: start Apache + MySQL, open http://localhost/phpmyadmin -> Import -> choose this file -> Go

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS coco_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coco_mall;

DROP TABLE IF EXISTS configurations;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  emoji         VARCHAR(16)  NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  description   TEXT NOT NULL,
  colors        VARCHAR(255) NOT NULL,      -- comma separated
  sizes         VARCHAR(255) NOT NULL,      -- comma separated
  engravable    TINYINT(1) NOT NULL DEFAULT 0,
  engrave_style VARCHAR(20) NULL,
  engrave_hint  VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE configurations (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  color        VARCHAR(50)  NOT NULL,
  size         VARCHAR(50)  NOT NULL,
  engraving    VARCHAR(16)  NOT NULL DEFAULT '',
  font         VARCHAR(30)  NOT NULL DEFAULT 'classic',
  price        DECIMAL(10,2) NULL,
  received_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO products (id, name, emoji, category, price, description, colors, sizes, engravable, engrave_style, engrave_hint) VALUES
(1, 'Steel Tumbler', '🥤', 'Drinkware', 19.99, 'Double-wall steel tumbler that keeps drinks cold for 24 hours. Add your name with a laser engraving.', 'Black,Blue,Green,Orange,Pink', '350 ml,500 ml,750 ml', 1, 'laser', 'Laser-engrave a name'),
(2, 'Personalised Cupcake Box', '🧁', 'Bakery', 12.5, 'Six fluffy cupcakes with silky frosting and a short message piped in icing.', 'Classic,Chocolate,Strawberry', 'Box of 4,Box of 6,Party box', 1, 'icing', 'Write a message in icing'),
(3, 'Classic Cotton Tee', '👕', 'Fashion', 14.99, 'Breathable 100% cotton tee with your name embroidered on the chest.', 'Black,White,Blue,Red,Green', 'S,M,L,XL', 1, 'stitch', 'Embroider a name on the chest'),
(4, 'Wireless Headphones', '🎧', 'Electronics', 59.99, 'Over-ear Bluetooth headphones with deep bass and 30 hours of battery life.', 'Black,White,Blue,Pink', 'Lite,Standard,Pro', 0, NULL, NULL),
(5, 'Leather Journal', '📔', 'Stationery', 15.99, 'Hand-stitched leather journal with thick cream pages. Add your initials on the cover.', 'Black,Beige,Red', 'A6,A5,A4', 1, 'gold', 'Deboss a name in gold'),
(6, 'Vanilla Candle', '🕯️', 'Home Decor', 11.5, 'Slow-burning soy candle with a warm vanilla scent. Burns for up to 40 hours.', 'White,Beige,Pink,Purple', 'Small,Medium,Large', 0, NULL, NULL),
(7, 'Smart Watch', '⌚', 'Electronics', 49, 'Fitness tracking, heart-rate monitor and notifications on a bright always-on display.', 'Black,Silver,Pink,Green', 'Standard,Plus,Max', 0, NULL, NULL),
(8, 'Birthday Cake', '🎂', 'Bakery', 24.99, 'Three-layer sponge cake with buttercream. Choose a flavour and write your own message on top.', 'Vanilla,Chocolate,Strawberry', 'Small,Regular,Family', 1, 'icing', 'Write a message in icing');
