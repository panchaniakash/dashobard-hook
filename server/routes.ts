import type { Express } from "express";
import { createServer, type Server } from "http";
import compression from "compression";
import { databaseService } from "./services/database";
import { cacheService } from "./services/cache";

interface FilterData {
  bucketId: number;
  userId: number;
  vertical?: string;
  Business?: string;
  year?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add compression middleware
  app.use(compression());
  
  // Add caching headers middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/dashboard')) {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    next();
  });

  // Get vertical data with caching
  app.post("/api/dashboard/getVertical", async (req, res) => {
    try {
      const { bucketId, userId }: FilterData = req.body;
      const cacheKey = `vertical_${bucketId}_${userId}`;
      
      // Check cache first
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ data: cachedData, cached: true });
      }

      // Check analytics group level
      const groupQuery = `
        SELECT ANALYTICS_GROUP_LEVEL_NAME 
        FROM ${process.env.SCHEMA || 'dbo'}.[ANALYTICS_GROUPS] 
        WHERE ANALYTICS_GROUP_ID = @bucketId
      `;
      
      const groupResult = await databaseService.executeQuery(groupQuery, { bucketId });
      
      let verticalData;
      
      if (groupResult.length > 0 && (groupResult[0] as any).ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
        const query = `SELECT DISTINCT VNAME FROM ${process.env.SCHEMA || 'dbo'}.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`;
        verticalData = await databaseService.executeQuery(query);
      } else {
        // Get VID from USERGROUPS based on USERID
        const vidQuery = `
          SELECT DISTINCT VID 
          FROM ${process.env.SCHEMA || 'dbo'}.USERGROUPS 
          WHERE USERID = @userId
        `;
        const vidResult = await databaseService.executeQuery(vidQuery, { userId });
        
        if (vidResult.length > 0) {
          const vidList = vidResult.map(row => (row as any).VID).join(',');
          const query = `
            SELECT DISTINCT VNAME 
            FROM ${process.env.SCHEMA || 'dbo'}.VERTICAL 
            WHERE VSTATUS = 'ACTIVE' 
            AND VID IN (${vidList})
            ORDER BY VNAME ASC
          `;
          verticalData = await databaseService.executeQuery(query);
        } else {
          return res.status(404).json({ error: 'No matching VID found' });
        }
      }

      // Cache the result
      cacheService.set(cacheKey, verticalData, 600000); // 10 minutes
      
      res.json({ data: verticalData, cached: false });
    } catch (error) {
      console.error('Error in getVertical:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get business data with caching
  app.post("/api/dashboard/getBusiness", async (req, res) => {
    try {
      const { bucketId, userId, vertical }: FilterData = req.body;
      const cacheKey = `business_${bucketId}_${userId}_${vertical}`;
      
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ data: cachedData, cached: true });
      }

      const groupQuery = `
        SELECT ANALYTICS_GROUP_LEVEL_NAME 
        FROM ${process.env.SCHEMA || 'dbo'}.[ANALYTICS_GROUPS] 
        WHERE ANALYTICS_GROUP_ID = @bucketId
      `;
      
      const groupResult = await databaseService.executeQuery(groupQuery, { bucketId });
      
      let businessData;
      
      if (groupResult.length > 0 && (groupResult[0] as any).ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
        const query = `
          SELECT DISTINCT B.BUNAME
          FROM ${process.env.SCHEMA || 'dbo'}.BUSINESS B
          JOIN ${process.env.SCHEMA || 'dbo'}.VERTICAL V ON B.VID = V.VID
          WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE' 
          ORDER BY B.BUNAME ASC
        `;
        businessData = await databaseService.executeQuery(query, { vertical });
      } else {
        const buidQuery = `
          SELECT DISTINCT BUID 
          FROM ${process.env.SCHEMA || 'dbo'}.USERGROUPS 
          WHERE USERID = @userId
        `;
        const buidResult = await databaseService.executeQuery(buidQuery, { userId });
        
        if (buidResult.length > 0) {
          const buidList = buidResult.map(row => (row as any).BUID).join(',');
          const query = `
            SELECT DISTINCT B.BUNAME
            FROM ${process.env.SCHEMA || 'dbo'}.BUSINESS B
            JOIN ${process.env.SCHEMA || 'dbo'}.VERTICAL V ON B.VID = V.VID
            WHERE V.VNAME = @vertical 
            AND BUID IN (${buidList}) 
            AND B.BUSTATUS = 'ACTIVE' 
            ORDER BY B.BUNAME ASC
          `;
          businessData = await databaseService.executeQuery(query, { vertical });
        } else {
          return res.status(404).json({ error: 'No matching BUID found' });
        }
      }

      cacheService.set(cacheKey, businessData, 300000); // 5 minutes
      res.json({ data: businessData, cached: false });
    } catch (error) {
      console.error('Error in getBusiness:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get site data with caching
  app.post("/api/dashboard/getSite", async (req, res) => {
    try {
      const { bucketId, userId, Business }: FilterData = req.body;
      const cacheKey = `site_${bucketId}_${userId}_${Business}`;
      
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ data: cachedData, cached: true });
      }

      const groupQuery = `
        SELECT ANALYTICS_GROUP_LEVEL_NAME 
        FROM ${process.env.SCHEMA || 'dbo'}.[ANALYTICS_GROUPS] 
        WHERE ANALYTICS_GROUP_ID = @bucketId
      `;
      
      const groupResult = await databaseService.executeQuery(groupQuery, { bucketId });
      
      let siteData;
      
      if (groupResult.length > 0 && (groupResult[0] as any).ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
        const query = `
          SELECT DISTINCT s.SINAME
          FROM ${process.env.SCHEMA || 'dbo'}.SITE s
          JOIN ${process.env.SCHEMA || 'dbo'}.BUSINESS b ON s.BUID = b.BUID
          WHERE b.BUNAME = @Business AND S.SISTATUS = 'ACTIVE' 
          ORDER BY S.SINAME ASC
        `;
        siteData = await databaseService.executeQuery(query, { Business });
      } else {
        const siidQuery = `
          SELECT DISTINCT SIID 
          FROM ${process.env.SCHEMA || 'dbo'}.USERGROUPS 
          WHERE USERID = @userId
        `;
        const siidResult = await databaseService.executeQuery(siidQuery, { userId });
        
        if (siidResult.length > 0) {
          const siidList = siidResult.map(row => (row as any).SIID).join(',');
          const query = `
            SELECT DISTINCT s.SINAME
            FROM ${process.env.SCHEMA || 'dbo'}.SITE s
            JOIN ${process.env.SCHEMA || 'dbo'}.BUSINESS b ON s.BUID = b.BUID
            WHERE b.BUNAME = @Business 
            AND s.SIID IN (${siidList}) 
            AND S.SISTATUS = 'ACTIVE' 
            ORDER BY S.SINAME ASC
          `;
          siteData = await databaseService.executeQuery(query, { Business });
        } else {
          return res.status(404).json({ error: 'No matching SIID found' });
        }
      }

      cacheService.set(cacheKey, siteData, 300000); // 5 minutes
      res.json({ data: siteData, cached: false });
    } catch (error) {
      console.error('Error in getSite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get years data with caching
  app.get("/api/dashboard/getYearsFromSecAuto", async (req, res) => {
    try {
      const cacheKey = 'years_data';
      
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ data: cachedData, cached: true });
      }

      const query = `SELECT DISTINCT YEAR FROM ${process.env.SCHEMA || 'dbo'}.OL_DSRSECAUTO ORDER BY YEAR DESC`;
      const yearData = await databaseService.executeQuery(query);
      
      cacheService.set(cacheKey, yearData, 3600000); // 1 hour
      res.json({ data: yearData, cached: false });
    } catch (error) {
      console.error('Error in getYearsFromSecAuto:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get months data with caching
  app.post("/api/dashboard/getMonthFromSecAuto", async (req, res) => {
    try {
      const { year } = req.body;
      const cacheKey = `months_${year}`;
      
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ data: cachedData, cached: true });
      }

      const query = `
        SELECT DISTINCT MONTH, MONTHNAME 
        FROM ${process.env.SCHEMA || 'dbo'}.OL_DSRSECAUTO 
        WHERE YEAR = @year 
        ORDER BY MONTH DESC
      `;
      const monthData = await databaseService.executeQuery(query, { year });
      
      cacheService.set(cacheKey, monthData, 3600000); // 1 hour
      res.json({ data: monthData, cached: false });
    } catch (error) {
      console.error('Error in getMonthFromSecAuto:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Performance metrics endpoint
  app.get("/api/dashboard/metrics", (req, res) => {
    res.json({
      cache: cacheService.getStats(),
      timestamp: Date.now(),
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
