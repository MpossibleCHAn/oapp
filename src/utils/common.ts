import path from "path"

const appRoot = process.cwd()
export const resolveApp = (...relativePaths: string[]): string => path.resolve(appRoot, ...relativePaths)

const srcDir = resolveApp("src")
const distDir = resolveApp("dist")

export const paths = {
	static: resolveApp("static"),
	dist: distDir,
	src: srcDir,
}
