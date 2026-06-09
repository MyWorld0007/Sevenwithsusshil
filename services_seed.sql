-- SQL Script to reconstruct and populate the 'services' table with all 8 alignment modalities.
-- Execute this query inside your MySQL database environment.

-- 1. Ensure the services table exists with the correct structure
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NULL,
  `price` VARCHAR(255) NULL,
  `rawPrice` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `iconText` VARCHAR(50) NULL,
  `features` TEXT NULL,
  `display_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Clear any existing records from services to prevent duplicates (Optionally comment this out if you just want to append)
TRUNCATE TABLE `services`;

-- 3. Insert the 8 Astro-Numerology Pricing services
INSERT INTO `services` (`id`, `title`, `price`, `rawPrice`, `description`, `iconText`, `features`, `display_order`) VALUES
(1, 
 'Child Birth Date & Name Alignment Analysis', 
 '₹51,000', 
 '₹51k', 
 'Discover the optimal name vibration and cosmic alignment for your child\'s birth energy.', 
 '👶', 
 '["Astro-Numerological Compatibility","Name Vibration & Alignment Solutions","Fortunate Starting Letters","Personalized Child Character Insights"]', 
 0),

(2, 
 'Career Path & Success Guidance', 
 '₹15,000', 
 '₹15k', 
 'Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions.', 
 '💼', 
 '["Career Aptitude Blueprint","Upcoming Opportunities Analysis","Obstacle Mitigation Strategy","Optimal Transition Timelines"]', 
 1),

(3, 
 'Relationship Compatibility Analysis', 
 '₹51,000', 
 '₹51k', 
 'Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth.', 
 '💑', 
 '["Vibrational Synergy Mapping","Core Conflict Point Assessment","Communication Bridge Remedies","Auspicious Timeline Tendencies"]', 
 2),

(4, 
 'Birth Date, Name Analysis & Name Correction', 
 '₹51,000', 
 '₹51k', 
 'A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony.', 
 '✨', 
 '["Lagna & Planetary Signature Review","Full Name Vibration Correction","Spelling Optimization Remedies","Signature Design Formatting"]', 
 3),

(5, 
 'Business Numerology & Prosperity Blueprint', 
 '₹1,00,005', 
 '₹1,00,005', 
 'Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success.', 
 '🏢', 
 '["Brand Name Spelling Harmonizer","Official Launch / Registration Timing","Key Shareholder Compatibility","Prosperity & Branding Colors Grid"]', 
 4),

(6, 
 'Lucky Numbers, Alphabets & Colour Alignment', 
 '₹37,000', 
 '₹37k', 
 'Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies.', 
 '🎨', 
 '["Fortunate Personal Numbers Selection","Vibrational Color Wardrobe Selection","Daily Routine Harmonizing","Alphabetic Signature Alignment"]', 
 5),

(7, 
 'Focused Insight Session', 
 '₹1,005', 
 '₹1005', 
 'Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question).', 
 '🎯', 
 '["Single Question Guidance","Precision Astral Calculations","Actionable Advice Blueprint","Swift Metaphysical Answers"]', 
 6),

(8, 
 'Gemstone, Crystal & Rudraksha Recommendation', 
 '₹5,001', 
 '₹5001', 
 'Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands.', 
 '💎', 
 '["Aura Strengthening Analysis","Planetary Energy Balancers","Gemstone Grade & Weight Advice","Rudraksha Mukhi Recommendations"]', 
 7);
