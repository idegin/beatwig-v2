#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const serviceAccountPath = path.resolve(process.cwd(), "service-account.json")
const envPath = path.resolve(process.cwd(), ".env")

function convertServiceAccountToEnvString() {
    console.log("🔧 Converting service-account.json to environment variable...")
    console.log(`📁 Looking for: ${serviceAccountPath}`)

    if (!fs.existsSync(serviceAccountPath)) {
        console.error("❌ Error: service-account.json not found in the project root.")
        console.log("📝 Please download your Firebase service account key from:")
        console.log("   Firebase Console → Project Settings → Service Accounts → Generate New Private Key")
        console.log("   Then save it as service-account.json in the project root.")
        process.exit(1)
    }

    try {
        const serviceAccountContent = fs.readFileSync(serviceAccountPath, "utf-8")
        const serviceAccountJson = JSON.parse(serviceAccountContent)

        const serviceAccountString = JSON.stringify(serviceAccountJson)

        const envLine = `\nFIREBASE_SERVICE_ACCOUNT_KEY='${serviceAccountString}'`

        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, "utf-8")

            if (envContent.includes("FIREBASE_SERVICE_ACCOUNT_KEY=")) {
                envContent = envContent.replace(
                    /FIREBASE_SERVICE_ACCOUNT_KEY=.*/g,
                    `FIREBASE_SERVICE_ACCOUNT_KEY='${serviceAccountString}'`
                )
                fs.writeFileSync(envPath, envContent)
                console.log("✅ Updated existing FIREBASE_SERVICE_ACCOUNT_KEY in .env")
            } else {
                fs.appendFileSync(envPath, envLine)
                console.log("✅ Added FIREBASE_SERVICE_ACCOUNT_KEY to .env")
            }
        } else {
            fs.writeFileSync(envPath, `# Firebase Service Account\n${envLine.trim()}\n`)
            console.log("✅ Created .env with FIREBASE_SERVICE_ACCOUNT_KEY")
        }

        console.log("\n📋 Environment variable has been set up successfully!")
        console.log("\n⚠️  IMPORTANT: Make sure to add the following to your .gitignore:")
        console.log("   - service-account.json")
        console.log("   - .env (if not already there)")
        console.log("\n🔐 Never commit your service account credentials to version control!")

    } catch (error) {
        console.error("❌ Error processing service-account.json:", error.message)
        process.exit(1)
    }
}

convertServiceAccountToEnvString()
