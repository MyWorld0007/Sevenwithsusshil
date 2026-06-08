-- ====================================================================
-- SevenAstro MySQL Database Restore & Initialization Script
-- Target Environment: Hostinger / PHPMyAdmin / Any Custom MySQL Server
-- Generated at: 2026-06-08 07:08:24 UTC
-- Contains: Schemas & full dataset insertion for all 6 tables:
--           1. admins
--           2. settings
--           3. life_paths
--           4. testimonials
--           5. content_pages
--           6. faqs
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. Table structure for table `admins`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `admins`
INSERT INTO `admins` (`id`, `email`, `password`) VALUES
(1, 'masteradmin@sevenastro.com', '@Masteradmin_2026');


-- --------------------------------------------------------------------
-- 2. Table structure for table `settings`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT NOT NULL,
  `whatsapp` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `whatsapp_message` TEXT DEFAULT NULL,
  `email_subject` VARCHAR(255) DEFAULT NULL,
  `email_body` TEXT DEFAULT NULL,
  `gemini_api_key` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `settings`
INSERT INTO `settings` (`id`, `whatsapp`, `email`, `whatsapp_message`, `email_subject`, `email_body`, `gemini_api_key`) VALUES
(1, '917039516551', '7s.evolve@gmail.com', 'Hello! I would like to book a session.', 'Book a Session', 'Hi Team Seven,\n\nI want to book a session.', NULL);


-- --------------------------------------------------------------------
-- 3. Table structure for table `life_paths`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `life_paths`;
CREATE TABLE `life_paths` (
  `id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `life_paths`
INSERT INTO `life_paths` (`id`, `name`, `desc`) VALUES
(1, 'The Leader', 'Born to lead, Life Path 1 individuals are independent, ambitious, and determined.'),
(2, 'The Peacemaker', 'Gifted with sensitivity, intuition, and creativity, Life Path 2 individuals are natural harmonizers.'),
(3, 'The Creator', 'Life Path 3 individuals are naturally creative, expressive, and charismatic.'),
(4, 'The Builder', 'Life Path 4 individuals are practical, disciplined, and hardworking.'),
(5, 'The Explorer', 'Life Path 5 individuals are adventurous, versatile, and freedom-loving.'),
(6, 'The Nurturer', 'Life Path 6 individuals are compassionate, responsible, and deeply caring.'),
(7, 'The Seeker', 'Life Path 7 individuals are analytical, intuitive, and deeply spiritual.'),
(8, 'The Achiever', 'Life Path 8 individuals are ambitious, powerful, and naturally gifted in leadership.'),
(9, 'The Humanitarian', 'Life Path 9 individuals are compassionate, idealistic, and driven by a desire to make a positive impact on the world.'),
(11, 'The Visionary', 'Life Path 11 is a Master Number associated with intuition, inspiration, and spiritual insight.'),
(13, 'The Disciplined Builder', 'Life Path 13/4 is a Karmic Debt number that emphasizes hard work, discipline, and perseverance.'),
(14, 'The Freedom Seeker', 'Life Path 14/5 is a Karmic Debt number that emphasizes freedom, adaptability, and personal growth through experience.'),
(16, 'The Spiritual Seeker', 'Life Path 16/7 is a Karmic Debt number associated with wisdom, introspection, and spiritual growth.'),
(19, 'The Independent Leader', 'Life Path 19/1 is a Karmic Debt number associated with leadership, independence, and self-reliance.'),
(22, 'The Master Builder', 'Life Path 22 is the most powerful Master Number, combining vision, leadership, and practicality.'),
(33, 'The Master Teacher', 'Life Path 33 is the Master Teacher, representing unconditional love, compassion, and selfless service.');


-- --------------------------------------------------------------------
-- 4. Table structure for table `testimonials`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` INT NOT NULL,
  `text` TEXT NOT NULL,
  `initial` VARCHAR(10) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `loc` VARCHAR(255) NOT NULL,
  `date` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `testimonials`
INSERT INTO `testimonials` (`id`, `text`, `initial`, `name`, `loc`, `date`, `rating`) VALUES
(1, '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', 'P', 'Priya Malhotra', 'Mumbai, India', 'October 2023', 5),
(2, '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', 'R', 'Rohan Kapoor', 'Bangalore, India', 'November 2023', 5),
(3, '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', 'A', 'Anjali Singh', 'Delhi, India', 'January 2024', 5),
(4, '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', 'S', 'Sarah T.', 'London, UK', 'March 2024', 5);


-- --------------------------------------------------------------------
-- 5. Table structure for table `content_pages`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `content_pages`;
CREATE TABLE `content_pages` (
  `slug` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  PRIMARY KEY (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `content_pages`
INSERT INTO `content_pages` (`slug`, `title`, `content`) VALUES
('terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.'),
('privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.'),
('faq', 'FAQ', '');


-- --------------------------------------------------------------------
-- 6. Table structure for table `faqs`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question` VARCHAR(500) NOT NULL,
  `answer` LONGTEXT NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `faqs`
INSERT INTO `faqs` (`id`, `question`, `answer`, `display_order`) VALUES
(1, 'What is Numerology?', 'Numerology is the study of numbers and their influence on our lives.', 0),
(2, 'How can I book a reading?', 'You can book a reading by visiting the Booking section on our homepage.', 0);

SET FOREIGN_KEY_CHECKS = 1;
