# Release process

Use the related GitHub Issue as the release log. Record the branch, dependencies,
acceptance criteria, validation results, and rollback instructions before changing
the version.

1. Compare `package.json` with `npm view @kubohiroya/turbowarp-extended-notification version`.
2. Choose the next semantic version and update `package.json`, both lockfiles,
   `CHANGELOG.md`, and every version-pinned installation URL.
3. Run `npm ci`, `npm run check`, `npm pack --dry-run`, and
   `npm publish --dry-run --access public`.
4. Merge the release PR only after review and CI succeed. Confirm the merge commit
   and the Pages deployment before publishing.
5. Publish once with `npm publish --access public`. Never overwrite an existing
   version.
6. Create an annotated `vX.Y.Z` tag at the release merge commit and push it. The
   release workflow creates the GitHub Release and attaches the JavaScript bundle
   and ZIP archive.
7. Verify the GitHub Release, npm dist-tag and tarball, version-pinned CDN bundle,
   and the public user-guide URL. Add the results to the Issue and close it.

To roll back documentation, revert the release PR and let Pages redeploy. Published
npm versions and tags are immutable: deprecate a defective version if needed and
publish a corrective patch instead of deleting or reusing it. A release artifact can
be replaced only when its bytes do not match the files at the immutable tag.
