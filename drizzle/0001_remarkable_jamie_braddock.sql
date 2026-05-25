CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`universityId` int NOT NULL,
	`courseCode` varchar(50) NOT NULL,
	`courseName` varchar(255) NOT NULL,
	`creditHours` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gpaHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`semester` varchar(50) NOT NULL,
	`gpa` decimal(4,3) NOT NULL,
	`cgpa` decimal(4,3) NOT NULL,
	`totalCreditHours` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gpaHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdfReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportType` enum('semester','cumulative','prediction') NOT NULL,
	`semester` varchar(50),
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pdfReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`semester` varchar(50) NOT NULL,
	`quizScore` decimal(5,2),
	`assignmentScore` decimal(5,2),
	`midsemScore` decimal(5,2),
	`examScore` decimal(5,2),
	`totalScore` decimal(5,2) NOT NULL,
	`grade` varchar(2) NOT NULL,
	`gradePoint` decimal(3,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `universities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`abbreviation` varchar(50) NOT NULL,
	`gradingScale` json NOT NULL,
	`classificationThresholds` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `universities_id` PRIMARY KEY(`id`),
	CONSTRAINT `universities_name_unique` UNIQUE(`name`),
	CONSTRAINT `universities_abbreviation_unique` UNIQUE(`abbreviation`)
);
--> statement-breakpoint
CREATE TABLE `userUniversities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`universityId` int NOT NULL,
	`studentId` varchar(100),
	`level` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userUniversities_id` PRIMARY KEY(`id`),
	CONSTRAINT `userUniversities_userId_unique` UNIQUE(`userId`)
);
