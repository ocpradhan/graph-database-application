import neo4j, { Driver } from "neo4j-driver";

const uri = process.env.COGNODB_URI as string;
const user = process.env.COGNODB_USER as string;
const password = process.env.COGNODB_PASSWORD as string;

let driver: Driver;

export function getCognoDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}
