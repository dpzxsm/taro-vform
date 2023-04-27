import * as React from 'react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import _flatten from 'lodash.flatten'
import Schema from 'async-validator'

function validate({ ...fieldsOptions }, { ...values }, ns) {
  return new Promise((resolve, reject) => {
    ns = ns || Object.keys(fieldsOptions)
    const fieldsRule = {}
    for (const name in fieldsOptions) {
      if (ns.includes(name)) {
        fieldsRule[name] = fieldsOptions[name].rules || [{ required: false }]
      }
    }
    for (const name in values) {
      if (!ns.includes(name)) {
        delete values[name]
      }
    }
    new Schema(fieldsRule).validate(values, errors => {
      if (errors) {
        const errorsObj = {}
        for (const { field, message } of errors || []) {
          errorsObj[field] = [{ message, field }]
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ errors: errorsObj, values })
      } else {
        resolve(values)
      }
    })
  })
}

function useForm(createOptions = {}) {
  const cacheData = useRef({
    fieldsTouched: {},
    fieldsValidated: {},
  })
  const fieldsOptions = useRef({})
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({})
  const [sources, setSources] = useState({})
  const [visibles, setVisibles] = useState({})
  const valuesRef = useRef(values)
  const sourcesRef = useRef(sources)
  const visiblesRef = useRef(visibles)
  useEffect(() => {
    valuesRef.current = values
    sourcesRef.current = sources
    visiblesRef.current = visibles
  }, [values, sources, visibles])

  const getFieldProps = useCallback(
    name => {
      const n = name instanceof Array ? name[0] : name
      const {
        trigger = 'onChange',
        valuePropName = 'value',
        normalize = e => (e && e.target ? e.target[valuePropName] : e),
      } = fieldsOptions.current[n]
      const props = {
        [trigger]: (...arg) => {
          const value = normalize(...arg)
          setValues(oldValues => {
            const currentValue = {}
            if (name instanceof Array && value instanceof Array) {
              name.forEach((n, index) => (currentValue[n] = value[index]))
            } else {
              currentValue[n] = value
            }
            const values = {
              ...oldValues,
              ...currentValue,
            }
            const { current } = cacheData
            current.currentField = n
            current.fieldsTouched[n] = true
            if (createOptions.onValuesChange) {
              createOptions.onValuesChange(
                {
                  [n]: value,
                },
                values
              )
            }
            valuesRef.current = values
            return values
          })
          const errorKeys = Object.keys(errors).filter(key => new RegExp('^' + n + '($|\\.)').test(key))
          if (errorKeys.length > 0) {
            setErrors(oldErrors => {
              Object.keys(oldErrors).forEach(key => {
                if (errorKeys.indexOf(key) !== -1) {
                  delete oldErrors[key]
                }
              })
              return {
                ...oldErrors,
              }
            })
          }
        },
      }
      props.source = sources[n] || []
      props.visible = visibles[n] !== undefined ? visibles[n] : true
      if (name instanceof Array) {
        const value = []
        name.forEach(n => {
          value.push(values[n])
        })
        props[valuePropName] = value
      } else {
        props[valuePropName] = values[name]
      }
      return props
    },
    [values, sources, visibles, createOptions, errors]
  )
  const objFilter = useCallback((obj, ns) => {
    if (ns) {
      Object.keys(obj).forEach(name => {
        if (!ns.includes(name)) {
          delete obj[name]
        }
      })
    }
    return obj
  }, [])
  const resetFields = useCallback(ns => {
    const { current } = cacheData
    delete current.currentField
    if (!ns) {
      setValues(() => ({}))
      setErrors(() => ({}))
      Object.keys(current).forEach(name => (current[name] = {}))
    } else {
      ns.forEach(name => {
        delete current.fieldsTouched[name]
        setValues(values => ({ ...values, [name]: undefined }))
        setErrors(oldErrors => {
          const errors = { ...oldErrors }
          delete errors[name]
          return errors
        })
      })
    }
  }, [])
  const validateFields = useCallback(
    (ns, options = {}) =>
      new Promise((resolve, reject) => {
        const { fieldsValidated } = cacheData.current
        if (ns) {
          ns.forEach(name => {
            fieldsValidated[name] = true
          })
        }
        if (options.force) {
          Object.keys(fieldsValidated).forEach(name => {
            if (fieldsValidated[name]) {
              delete errors[name]
            }
          })
        }
        const fixOptions = {}
        const fixValues = {}
        Object.keys(visiblesRef.current).forEach(key => {
          const isVisible = visiblesRef.current[key]
          if (isVisible) {
            fixOptions[key] = fieldsOptions.current[key]
            fixValues[key] = valuesRef.current[key]
          }
        })
        // 筛选出visible=false的字段
        validate(fixOptions, fixValues, ns)
          .then(values => resolve(values))
          .catch(a => {
            const { errors: newErrors } = a
            setErrors({
              ...newErrors,
            })
            reject(newErrors[Object.keys(newErrors)[0]][0])
          })
      }),
    [errors]
  )
  const reRenderRef = useRef(true)
  reRenderRef.current = true
  const getFieldDecorator = useCallback(
    (
      name,
      options = {
        rules: [{ required: false }],
        initialVisible: true,
        initialSource: [],
      }
    ) => {
      if (reRenderRef.current) {
        fieldsOptions.current = {}
        reRenderRef.current = false
      }
      const setOptions = (name, index) => {
        fieldsOptions.current[name] = options
        values[name] =
          values[name] !== undefined || cacheData.current.fieldsTouched[name]
            ? values[name]
            : index !== undefined
            ? (options.initialValue || [])[index]
            : options.initialValue

        sources[name] =
          sources[name] !== undefined || cacheData.current.fieldsTouched[name] ? sources[name] : options.initialSource

        visibles[name] =
          visibles[name] !== undefined || cacheData.current.fieldsTouched[name]
            ? visibles[name]
            : options.initialVisible
      }
      if (name instanceof Array) {
        name.forEach((n, i) => setOptions(n, i))
      } else {
        setOptions(name)
      }
      valuesRef.current = values
      sourcesRef.current = sources
      visiblesRef.current = visibles
      const props = getFieldProps(name)
      return fieldElem => {
        const { trigger = 'onChange' } = options
        return React.cloneElement(fieldElem, {
          ...fieldElem.props,
          ...props,
          [trigger]: (...arg) => {
            if (fieldElem.props[trigger]) {
              fieldElem.props[trigger](...arg)
            }
            props[trigger](...arg)
          },
        })
      }
    },
    [values, sources, visibles, getFieldProps]
  )
  const setFieldValue = useCallback(
    (name, value) =>
      setValues(oldValues => {
        const values = { ...oldValues, [name]: value }
        valuesRef.current = values
        return values
      }),
    []
  )
  const setFieldsValue = useCallback(
    ({ ...newValues }) =>
      setValues(oldValues => {
        const values = { ...oldValues, ...newValues }
        valuesRef.current = values
        return values
      }),
    []
  )

  const setFieldSource = useCallback(
    (name, source) =>
      setSources(oldSources => {
        const sources = { ...oldSources, [name]: source }
        sourcesRef.current = sources
        return sources
      }),
    []
  )

  const setFieldVisible = useCallback(
    (name, visible) =>
      setVisibles(oldVisibles => {
        const visibles = { ...oldVisibles, [name]: visible }
        visiblesRef.current = visibles
        return visibles
      }),
    []
  )

  const getFieldsValue = useCallback(
    ns => {
      const result = { ...valuesRef.current }
      objFilter(result, ns)
      return result
    },
    [objFilter]
  )
  const getFieldValue = useCallback(name => valuesRef.current[name], [])
  const getFieldSource = useCallback(name => sourcesRef.current[name], [])
  const getFieldVisible = useCallback(name => {
    return visiblesRef.current[name] === undefined ? true : visiblesRef.current[name]
  }, [])

  const getFieldsError = useCallback(
    ns => {
      const result = { ...errors }
      objFilter(result, ns)
      return result
    },
    [errors, objFilter]
  )
  const getFieldError = useCallback(
    name => {
      return Object.keys(errors)
        .filter(key => new RegExp('^' + name + '($|\\.)').test(key))
        .map(key => errors[key])
        .reduce((total, current) => total.concat(current), [])
    },
    [errors]
  )
  const setFields = useCallback(fields => {
    setValues(oldValues => {
      const values = { ...oldValues }
      for (const name in fields) {
        const { value } = fields[name]
        values[name] = value
      }
      return values
    })
    setErrors(oldErrors => {
      const errors = { ...oldErrors }
      for (const name in fields) {
        const errorArr = fields[name].errors || []
        errors[name] = errorArr.map(({ message }) => ({
          message,
          field: name,
        }))
      }
      return errors
    })
  }, [])
  const isFieldTouched = useCallback(name => Boolean(cacheData.current.fieldsTouched[name]), [])
  const isFieldsTouched = useCallback((names = []) => names.some(x => Boolean(cacheData.current.fieldsTouched[x])), [])
  const errorsArr = useMemo(() => _flatten(Object.keys(errors).map(key => errors[key] || [])), [errors])

  return {
    errors,
    errorsArr,
    values,
    visibles,
    sources,
    resetFields,
    validateFields,
    getFieldDecorator,
    setFieldValue,
    setFieldsValue,
    setFieldSource,
    setFieldVisible,
    getFieldValue,
    getFieldsValue,
    getFieldSource,
    getFieldVisible,
    getFieldsError,
    getFieldError,
    setFields,
    isFieldTouched,
    isFieldsTouched,
  }
}

export default useForm
