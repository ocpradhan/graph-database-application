import { getCognoDriver } from "./cogno";

export async function runGraphSeed() {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    // Clear existing graph
    await session.run("MATCH (n) DETACH DELETE n");

    // Load realistic supply chain graph
    await session.run(`
      CREATE (tsmc:Supplier {id: 'sup-tsmc', name: 'TSMC Foundry', riskScore: 85})
      CREATE (foxconn:Supplier {id: 'sup-foxconn', name: 'Foxconn Assembly', riskScore: 30})
      
      CREATE (soc:Component {id: 'comp-soc', name: '3nm System on Chip (SoC)', riskScore: 75})
      CREATE (oled:Component {id: 'comp-oled', name: 'OLED Display Panel', riskScore: 40})
      
      CREATE (port:LogisticsHub {id: 'hub-port', name: 'Port of Los Angeles', riskScore: 20})
      CREATE (phone:Product {id: 'prod-phone', name: 'Flagship Smartphone', riskScore: 50})

      /* TSMC supplies SoC, which ships via Port to Product Assembly */
      CREATE (tsmc)-[:SUPPLIES {id: 'rel-1'}]->(soc)
      CREATE (foxconn)-[:SUPPLIES {id: 'rel-2'}]->(oled)
      
      CREATE (soc)-[:SHIPPED_VIA {id: 'rel-3'}]->(port)
      CREATE (port)-[:PART_OF {id: 'rel-4'}]->(phone)
      CREATE (oled)-[:PART_OF {id: 'rel-5'}]->(phone)
    `);

    return { success: true };
  } finally {
    await session.close();
  }
}
