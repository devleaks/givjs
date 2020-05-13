import path from 'path'
import postcssUrl from 'postcss-url'
import _defaults from 'lodash/defaults'

export default (options) => {
  options = _defaults(options, {
    dest: process.cwd()
  })

  return [
    postcssUrl(), // Find files
    postcssUrl({
      url: 'copy',
      basePath: options.basePath,
      useHash: true,
      assetsPath: options.assetsPath
    }), // Copy to destination
    postcssUrl({
      url (asset) {
        const rebasedUrl = `${options.assetsPath.replace(options.dest, '')}/${path.basename(asset.absolutePath)}`

        return `${rebasedUrl}${asset.search}${asset.hash}`
      }
    }) // Fix path
  ]
}
