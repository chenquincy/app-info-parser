const protoBuffer = require('protobufjs')
const { isArray } = require('../utils')
const json = require('./proto/resource.json')

const root = protoBuffer.Root.fromJSON(json)
const XmlNode = root.lookupType('aapt.pb.XmlNode')

const INTENT_MAIN = 'android.intent.action.MAIN'
const CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER'

class PBManifestParser {
  constructor (buffer) {
    this.buffer = buffer
    const xml = XmlNode.decode(buffer)
    const result = XmlNode.toObject(xml, {
      enums: String,
      arrays: true,
      objects: true
    })
    this.document = result.element
  }

  collapseAttributes (element) {
    if (!isArray(element.attribute)) {
      return {}
    }
    const collapsed = {}
    for (let attr of element.attribute) {
      if (attr.compiledItem) {
        if (attr.compiledItem.prim) {
          collapsed[attr.name] = attr.compiledItem.prim.intDecimalValue || attr.value
        } else if (attr.compiledItem.ref) {
          collapsed[attr.name] = `resourceId:0x${attr.compiledItem.ref.id.toString(16)}`
        } else {
          collapsed[attr.name] = attr.value
        }
      } else {
        collapsed[attr.name] = attr.value
      }
    }
    return collapsed
  }

  parseIntents (element, target) {
    target.intentFilters = []
    target.metaData = []

    return element.child.forEach(element => {
      switch (element.name) {
        case 'intent-filter': {
          const intentFilter = this.collapseAttributes(element)

          intentFilter.actions = []
          intentFilter.categories = []
          intentFilter.data = []

          element.child.forEach(element => {
            switch (element.name) {
              case 'action':
                intentFilter.actions.push(this.collapseAttributes(element))
                break
              case 'category':
                intentFilter.categories.push(this.collapseAttributes(element))
                break
              case 'data':
                intentFilter.data.push(this.collapseAttributes(element))
                break
            }
          })

          target.intentFilters.push(intentFilter)
          break
        }
        case 'meta-data':
          target.metaData.push(this.collapseAttributes(element))
          break
      }
    })
  }

  parseApplication (element) {
    const app = this.collapseAttributes(element)

    app.activities = []
    app.activityAliases = []
    app.launcherActivities = []
    app.services = []
    app.receivers = []
    app.providers = []
    app.usesLibraries = []
    app.metaData = []

    element.child.forEach(element => {
      switch (element.name) {
        case 'activity': {
          const activity = this.collapseAttributes(element)
          this.parseIntents(element, activity)
          app.activities.push(activity)
          if (this.isLauncherActivity(activity)) {
            app.launcherActivities.push(activity)
          }
          break
        }
        case 'activity-alias': {
          const activityAlias = this.collapseAttributes(element)
          this.parseIntents(element, activityAlias)
          app.activityAliases.push(activityAlias)
          if (this.isLauncherActivity(activityAlias)) {
            app.launcherActivities.push(activityAlias)
          }
          break
        }
        case 'service': {
          const service = this.collapseAttributes(element)
          this.parseIntents(element, service)
          app.services.push(service)
          break
        }
        case 'receiver': {
          const receiver = this.collapseAttributes(element)
          this.parseIntents(element, receiver)
          app.receivers.push(receiver)
          break
        }
        case 'provider': {
          const provider = this.collapseAttributes(element)

          provider.grantUriPermissions = []
          provider.metaData = []
          provider.pathPermissions = []

          element.child.forEach(element => {
            switch (element.name) {
              case 'grant-uri-permission':
                provider.grantUriPermissions.push(this.collapseAttributes(element))
                break
              case 'meta-data':
                provider.metaData.push(this.collapseAttributes(element))
                break
              case 'path-permission':
                provider.pathPermissions.push(this.collapseAttributes(element))
                break
            }
          })

          app.providers.push(provider)
          break
        }
        case 'uses-library':
          app.usesLibraries.push(this.collapseAttributes(element))
          break
        case 'meta-data':
          app.metaData.push(this.collapseAttributes(element))
          break
      }
    })

    return app
  }

  isLauncherActivity (activity) {
    return activity.intentFilters.some(function (filter) {
      const hasMain = filter.actions.some(action => action.name === INTENT_MAIN)
      if (!hasMain) {
        return false
      }
      return filter.categories.some(category => category.name === CATEGORY_LAUNCHER)
    })
  }

  parse () {
    const manifest = this.collapseAttributes(this.document)

    manifest.usesPermissions = []
    manifest.permissions = []
    manifest.permissionTrees = []
    manifest.permissionGroups = []
    manifest.instrumentation = null
    manifest.usesSdk = null
    manifest.usesConfiguration = null
    manifest.usesFeatures = []
    manifest.supportsScreens = null
    manifest.compatibleScreens = []
    manifest.supportsGlTextures = []
    manifest.application = Object.create(null)

    this.document.child = this.document.child.filter(item => !!item.element).map(item => item.element)
    this.document.child.forEach(element => {
      switch (element.name) {
        case 'uses-permission':
          manifest.usesPermissions.push(this.collapseAttributes(element))
          break
        case 'permission':
          manifest.permissions.push(this.collapseAttributes(element))
          break
        case 'permission-tree':
          manifest.permissionTrees.push(this.collapseAttributes(element))
          break
        case 'permission-group':
          manifest.permissionGroups.push(this.collapseAttributes(element))
          break
        case 'instrumentation':
          manifest.instrumentation = this.collapseAttributes(element)
          break
        case 'uses-sdk':
          manifest.usesSdk = this.collapseAttributes(element)
          break
        case 'uses-configuration':
          manifest.usesConfiguration = this.collapseAttributes(element)
          break
        case 'uses-feature':
          manifest.usesFeatures.push(this.collapseAttributes(element))
          break
        case 'supports-screens':
          manifest.supportsScreens = this.collapseAttributes(element)
          break
        case 'compatible-screens':
          element.child = element.child.filter(item => !!item.element).map(item => item.element)
          element.child.forEach(screen => {
            return manifest.compatibleScreens.push(this.collapseAttributes(screen))
          })
          break
        case 'supports-gl-texture':
          manifest.supportsGlTextures.push(this.collapseAttributes(element))
          break
        case 'application':
          manifest.application = this.parseApplication(element)
          break
      }
    })

    return manifest
  }
}

module.exports = PBManifestParser
