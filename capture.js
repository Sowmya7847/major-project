const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const desktopPath = "C:\\Users\\ADMIN\\OneDrive\\Desktop";

const styles = "body { background-color: #121212; color: #00ff00; font-family: 'Courier New', Courier, monospace; padding: 20px; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; } .terminal { background-color: #000; border: 1px solid #333; border-radius: 8px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); width: 800px; white-space: pre-wrap; font-size: 18px; line-height: 1.5; } .success { color: #00ff00; } .info { color: #00bfff; } .warning { color: #ffa500; } .white { color: #ffffff; } .header { color: #ff00ff; font-weight: bold; } .progress { color: #00ff00; }";

const screens = [
  {
    name: 'Security_Dashboard.png',
    content: "<div class='terminal'>\n<span class='header'>[MONITORING DASHBOARD - SYSTEM OVERVIEW]</span>\nActive Security Status: <span class='success'>SECURE ✓</span>\nLast Security Scan: 2024-01-15 14:32:07 UTC\n\nReal-time Metrics:\n• Encryption Throughput: <span class='info'>2.41 GB/s</span>\n• Active Processing Jobs: <span class='info'>3</span>\n• Data Encrypted Today: <span class='info'>847.3 GB</span>\n• Key Operations (24h): <span class='info'>18,472</span>\n• Access Denials (24h): <span class='warning'>12</span>\n• Integrity Failures (24h): <span class='success'>0</span>\n\nCluster Health: <span class='success'>10/10 Nodes HEALTHY</span>\nKMS Status: <span class='success'>OPERATIONAL (Uptime: 99.94%)</span>\nHSM Status: <span class='success'>ONLINE</span>\n</div>"
  },
  {
    name: 'Data_Ingestion.png',
    content: "<div class='terminal'>\n<span class='header'>[DATA INGESTION MODULE - BATCH UPLOAD]</span>\nFile: financial_records_q1_2024.parquet  (10.2 GB)\nEncryption: ChaCha20-Poly1305 (256-bit)  <span class='success'>✓</span>\nAccess Policy: <span class='info'>ANALYST AND (DATA_SCIENTIST OR COMPLIANCE)</span>\n\nIngestion Progress:\n<span class='progress'>████████████████████████████████████████ 100%</span>\nChunks Processed: 82/82  <span class='success'>✓</span>\nEncryption Speed: <span class='info'>2.38 GB/s</span>\nTotal Time: 00:04:17\nIntegrity Tags Generated: 82/82 <span class='success'>✓</span>\nAccess Policy Applied: <span class='success'>✓</span>\n\n<span class='header'>[INGESTION COMPLETE]</span> Data stored at /data/secure/fin_records_q1_2024\n</div>"
  },
  {
    name: 'Spark_Job.png',
    content: "<div class='terminal'>\n<span class='header'>[SPARK SECURE PROCESSING JOB]</span>\nJob ID: spark-job-20240115-143205\n\nStages:\n  Stage 1: Read Encrypted HDFS → <span class='success'>[COMPLETED]</span> 18.3s\n  Stage 2: In-Memory Decrypt → <span class='success'>[COMPLETED]</span> 2.1s\n  Stage 3: HMAC Verification → <span class='success'>[COMPLETED]</span> 0.8s  <span class='success'>✓</span>\n  Stage 4: Analytics Transform → <span class='success'>[COMPLETED]</span> 156.4s\n  Stage 5: Re-encrypt Output → <span class='success'>[COMPLETED]</span> 2.4s\n  Stage 6: Write to HDFS → <span class='success'>[COMPLETED]</span> 14.8s\n\nTotal Job Time: <span class='info'>195.8s</span> (Baseline: 172.6s, Overhead: 13.4%)\nTasks: 800 completed, 0 failed\nSecurity Events: <span class='success'>0 violations, 0 integrity failures</span>\n</div>"
  }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  for (const screen of screens) {
    const html = "<!DOCTYPE html><html><head><style>" + styles + "</style></head><body>" + screen.content + "</body></html>";
    await page.setContent(html);
    const element = await page.$('.terminal');
    const outputPath = path.join(desktopPath, screen.name);
    await element.screenshot({ path: outputPath });
    console.log("Saved screenshot to " + outputPath);
  }

  await browser.close();
})();
