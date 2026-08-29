import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  subject: text("subject").notNull(),
  courseCode: text("course_code").notNull(),
  category: text("category").notNull(),
  semester: text("semester").notNull(),
  year: integer("year").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  objectPath: text("object_path"),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedByName: text("uploaded_by_name").notNull(),
  status: text("status").notNull().default("pending"),
  downloads: integer("downloads").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewNote: text("review_note"),
});

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({
  id: true,
  createdAt: true,
  downloads: true,
});
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;