import { defineEventHandler } from "h3";
import { getCompaniesOverview } from "~~/server/utils/companiesOverviewCache";

export default defineEventHandler((event) => getCompaniesOverview(event));
