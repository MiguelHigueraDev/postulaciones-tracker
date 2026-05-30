import { defineEventHandler } from "h3";
import { getCompaniesDirectory } from "~~/server/utils/companiesDirectoryCache";

export default defineEventHandler((event) => getCompaniesDirectory(event));
