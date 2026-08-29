import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import {
  ApproveSubmissionParams,
  ApproveSubmissionResponse,
  CreateMaterialBody,
  CreateMaterialResponse,
  GetDashboardStatsResponse,
  GetMaterialParams,
  GetMaterialResponse,
  ListAdminSubmissionsQueryParams,
  ListAdminSubmissionsResponse,
  ListMaterialsQueryParams,
  ListMaterialsResponse,
  ListSubjectsResponse,
  RejectSubmissionBody,
  RejectSubmissionParams,
  RejectSubmissionResponse,
} from "@workspace/api-zod";
import { db, materialsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/materials", async (req, res): Promise<void> => {
  const parsed = ListMaterialsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, subject, category, semester, sort } = parsed.data;
  const conditions = [
    eq(materialsTable.status, "approved"),
    subject ? eq(materialsTable.subject, subject) : undefined,
    category ? eq(materialsTable.category, category) : undefined,
    semester ? eq(materialsTable.semester, semester) : undefined,
    search
      ? or(
          ilike(materialsTable.title, `%${search}%`),
          ilike(materialsTable.description, `%${search}%`),
          ilike(materialsTable.subject, `%${search}%`),
          ilike(materialsTable.courseCode, `%${search}%`),
        )
      : undefined,
  ].filter(Boolean);

  const materials = await db
    .select()
    .from(materialsTable)
    .where(and(...conditions))
    .orderBy(sort === "popular" ? desc(materialsTable.downloads) : desc(materialsTable.createdAt));

  res.json(ListMaterialsResponse.parse(materials));
});

router.post("/materials", async (req, res): Promise<void> => {
  const parsed = CreateMaterialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const authUserId = getAuth(req).userId;
  const [material] = await db
    .insert(materialsTable)
    .values({
      ...parsed.data,
      uploadedBy: authUserId ?? parsed.data.uploadedBy,
      status: "pending",
      objectPath: parsed.data.objectPath ?? null,
    })
    .returning();

  res.status(201).json(CreateMaterialResponse.parse(material));
});

router.get("/materials/:id", async (req, res): Promise<void> => {
  const params = GetMaterialParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [material] = await db
    .select()
    .from(materialsTable)
    .where(
      and(eq(materialsTable.id, params.data.id), eq(materialsTable.status, "approved")),
    );

  if (!material) {
    res.status(404).json({ error: "Material not found" });
    return;
  }

  res.json(GetMaterialResponse.parse(material));
});

router.get("/subjects", async (_req, res): Promise<void> => {
  const subjects = await db
    .select({
      subject: materialsTable.subject,
      count: count(materialsTable.id),
    })
    .from(materialsTable)
    .where(eq(materialsTable.status, "approved"))
    .groupBy(materialsTable.subject)
    .orderBy(asc(materialsTable.subject));

  res.json(ListSubjectsResponse.parse(subjects));
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalMaterials: count(materialsTable.id),
      totalDownloads: sql<number>`coalesce(sum(${materialsTable.downloads}), 0)`,
    })
    .from(materialsTable)
    .where(eq(materialsTable.status, "approved"));
  const [subjectTotals] = await db
    .select({ totalSubjects: sql<number>`count(distinct ${materialsTable.subject})` })
    .from(materialsTable)
    .where(eq(materialsTable.status, "approved"));
  const [pending] = await db
    .select({ pendingSubmissions: count(materialsTable.id) })
    .from(materialsTable)
    .where(eq(materialsTable.status, "pending"));
  const popularSubjects = await db
    .select({
      subject: materialsTable.subject,
      count: count(materialsTable.id),
    })
    .from(materialsTable)
    .where(eq(materialsTable.status, "approved"))
    .groupBy(materialsTable.subject)
    .orderBy(desc(count(materialsTable.id)))
    .limit(5);

  res.json(
    GetDashboardStatsResponse.parse({
      totalMaterials: Number(totals?.totalMaterials ?? 0),
      totalSubjects: Number(subjectTotals?.totalSubjects ?? 0),
      pendingSubmissions: Number(pending?.pendingSubmissions ?? 0),
      totalDownloads: Number(totals?.totalDownloads ?? 0),
      popularSubjects,
    }),
  );
});

router.get("/admin/submissions", async (req, res): Promise<void> => {
  const parsed = ListAdminSubmissionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status } = parsed.data;
  const submissions = await db
    .select()
    .from(materialsTable)
    .where(status === "all" ? undefined : eq(materialsTable.status, status))
    .orderBy(desc(materialsTable.createdAt));

  res.json(ListAdminSubmissionsResponse.parse(submissions));
});

router.patch("/admin/submissions/:id/approve", async (req, res): Promise<void> => {
  const params = ApproveSubmissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [material] = await db
    .update(materialsTable)
    .set({ status: "approved", reviewNote: null })
    .where(eq(materialsTable.id, params.data.id))
    .returning();
  if (!material) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  res.json(ApproveSubmissionResponse.parse(material));
});

router.patch("/admin/submissions/:id/reject", async (req, res): Promise<void> => {
  const params = RejectSubmissionParams.safeParse(req.params);
  const body = RejectSubmissionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid rejection request" });
    return;
  }

  const [material] = await db
    .update(materialsTable)
    .set({ status: "rejected", reviewNote: body.data.reviewNote })
    .where(eq(materialsTable.id, params.data.id))
    .returning();
  if (!material) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  res.json(RejectSubmissionResponse.parse(material));
});

export default router;