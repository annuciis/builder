import React from 'react'
import Attribute from '../attribute'
import lodash from 'lodash'
import { getStorage, getService } from 'vc-cake'
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc'

const workspaceStorage = getStorage('workspace')
const cook = getService('cook')
const hubElementsService = getService('hubElements')

export default class ParamsGroupAttribute extends Attribute {
  constructor (props) {
    super(props)
    this.clickAdd = this.clickAdd.bind(this)
    this.clickClone = this.clickClone.bind(this)
    this.clickDelete = this.clickDelete.bind(this)
    this.clickEdit = this.clickEdit.bind(this)

    this.getSortableHandle = this.getSortableHandle.bind(this)
    this.getSortableList = this.getSortableList.bind(this)
    this.getSortableItems = this.getSortableItems.bind(this)
  }

  onParamChange (index, element, paramFieldKey, newValue) {
    element.set(paramFieldKey, newValue)
    let value = this.state.value
    value.value[ index ][ paramFieldKey ] = newValue
    let { updater, fieldKey, fieldType } = this.props
    updater(fieldKey, value, null, fieldType)
  }

  updateState (props) {
    if (props.value.groups && props.value.value) {
      return { value: props.value }
    } else {
      let value = {}
      value.value = props.value
      value.groups = props.options.groups.map((group) => {
        return {
          title: group,
          settings: props.options.settings
        }
      })
      return { value: value }
    }
  }

  setFieldValue (value) {
    let { updater, fieldKey, fieldType } = this.props
    updater(fieldKey, value, null, fieldType)
    this.setState({ value: value })
  }

  clickEdit (index) {
    let groupName = this.state.value.groups[ index ]
    let tag = `${this.props.element.get('tag')}-${this.props.element.get('id')}-${this.props.fieldKey}`
    hubElementsService.add({ settings: {}, tag: tag })
    let settings = this.props.options.settings
    settings.name = { type: 'string', value: 'test', 'access': 'public' }
    settings.tag = { type: 'string', value: tag, 'access': 'public' }
    cook.add(settings)
    let value = this.state.value.value[ index ]
    value.tag = tag
    value.name = 'test'
    let element = cook.get(value).toJS()

    let options = {
      child: true,
      parentElement: this.props.element,
      parentElementOptions: this.props.elementOptions,
      element: element, // Current
      activeParamGroup: groupName,
      customUpdater: this.onParamChange.bind(this, index)
    }
    workspaceStorage.trigger('edit', element.id, element.tag, options)
  }

  clickAdd () {
    let { groups, value } = this.state.value
    let { settings } = this.props.options
    let newValue = {}
    groups.push({
      title: 'Group title',
      settings: settings
    })
    Object.keys(settings).forEach((setting) => {
      newValue[ setting ] = settings[ setting ].value
    })
    value.push(lodash.defaultsDeep({}, newValue))
    let newState = {
      groups: groups,
      value: value
    }
    this.setFieldValue(newState)
  }

  clickClone (index) {
    let { groups, value } = this.state.value
    groups.push(lodash.defaultsDeep({}, groups[ index ]))
    value.push(lodash.defaultsDeep({}, value[ index ]))
    let newState = {
      groups: groups,
      value: value
    }
    this.setFieldValue(newState)
  }

  clickDelete (index) {
    let { groups, value } = this.state.value
    groups.splice(index, 1)
    value.splice(index, 1)
    let newState = {
      groups: groups,
      value: value
    }
    this.setFieldValue(newState)
  }

  getSortableItems () {
    const SortableItem = SortableElement(({ value, groupIndex }) => {
      let editable = false
      let controlLabelClasses = 'vcv-ui-tree-layout-control-label'
      if (editable) {
        controlLabelClasses += ' vcv-ui-tree-layout-control-label-editable'
      }

      return (
        <div className='vcv-ui-form-params-group-item vcv-ui-tree-layout-control'>
          {this.getSortableHandle()}
          <div className='vcv-ui-tree-layout-control-content'>
            <span className={controlLabelClasses}>
              <span ref={span => { this.span = span }}
                contentEditable={editable}
                suppressContentEditableWarning>
                {value.title}
              </span>
            </span>
            {this.getChildControls(groupIndex)}
          </div>
        </div>
      )
    })

    return this.state.value.groups.map((group, index) => {
      return (
        <SortableItem key={`sortable-item-paramgroup-${index}`}
          index={index}
          value={group}
          groupIndex={index} />
      )
    })
  }

  getSortableList () {
    const SortableList = SortableContainer(() => {
      return (
        <div>
          {this.getSortableItems()}
        </div>
      )
    })

    const onSortEnd = ({ oldIndex, newIndex }) => {
      let newState = this.state.value
      newState.groups = arrayMove(this.state.value.groups, oldIndex, newIndex)
      newState.value = arrayMove(this.state.value.value, oldIndex, newIndex)
      this.setFieldValue(newState)
    }

    let useDragHandle = true

    return (
      <SortableList lockAxis={'y'}
        useDragHandle={useDragHandle}
        helperClass={'vcv-ui-form-params-group-item--dragging'}
        onSortEnd={onSortEnd}
        items={this.state.value.groups} />
    )
  }

  getSortableHandle () {
    const SortableHandler = SortableHandle(() => {
      let dragHelperClasses = 'vcv-ui-tree-layout-control-drag-handler vcv-ui-drag-handler'
      return (
        <div className={dragHelperClasses}>
          <i className='vcv-ui-drag-handler-icon vcv-ui-icon vcv-ui-icon-drag-dots' />
        </div>
      )
    })

    return (<SortableHandler />)
  }

  getChildControls (index) {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const cloneText = localizations ? localizations.clone : 'Clone'
    const removeText = localizations ? localizations.remove : 'Remove'
    const editText = localizations ? localizations.edit : 'Edit'
    return (
      <div className='vcv-ui-tree-layout-control-actions-container'>
        <span className='vcv-ui-tree-layout-control-actions'>
          <span className='vcv-ui-tree-layout-control-action' title={cloneText} onClick={() => { this.clickClone(index) }}>
            <i className='vcv-ui-icon vcv-ui-icon-copy' />
          </span>
          <span className='vcv-ui-tree-layout-control-action' title={removeText} onClick={() => { this.clickDelete(index) }}>
            <i className='vcv-ui-icon vcv-ui-icon-trash' />
          </span>
        </span>
        <span className='vcv-ui-tree-layout-control-action' title={editText} onClick={() => { this.clickEdit(index) }}>
          <i className='vcv-ui-icon vcv-ui-icon-arrow-right' />
        </span>
      </div>
    )
  }

  render () {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const addText = localizations ? localizations.add : 'Add'
    return (
      <React.Fragment>
        {this.state.value.groups && this.state.value.groups.length ? null : (
          <div className='vcv-ui-form-group-heading'>{this.props.options.title}</div>
        )}
        <div className='vcv-ui-form-params-group'>
          {this.getSortableList()}
          <div className='vcv-ui-form-params-group-add-item vcv-ui-icon vcv-ui-icon-add' onClick={this.clickAdd} title={addText} />
        </div>
      </React.Fragment>
    )
  }
}
