import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import { profile, order } from "../DataBase/db"

export const generateFile = (dataCallback, endCallback) => {
    const doc = new PDFDocument()
    doc.on("data", dataCallback)
    doc.on("end", endCallback)
    doc.fontSize(25).text("Some heading")
    doc.end()
}
