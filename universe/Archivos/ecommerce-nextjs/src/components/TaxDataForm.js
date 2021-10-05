import React, { Component } from 'react'

import { Grid, Button, TextField, Typography, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'

import Utils from '../resources/Utils'
import CloseIcon from '@material-ui/icons/Close'
import { getDataAPI, requestAPI } from '../api/CRUD'
import TaxDataFormField from './TaxDataTaxFormField'
import TaxDataTaxFormRadioGroup from './TaxDataTaxFormRadioGroup'
import TaxDataFormNeighborhoodSelect from './TaxDataFormNeighborhoodSelect'

export default class TaxDataForm extends Component {
  constructor(props) {
    super(props)

    const {
      toEditBillingDataInfo: { isLegalEntity, name, lastName, secondLastName, phone, businessName, rfc, email, exteriorNumber, interiorNumber, street, zip, voterID }
    } = this.props

    this.state = {
      formValues: {
        isLegalEntity: isLegalEntity ?? 'fisica',
        name: name ?? '',
        lastName: lastName ?? '',
        secondLastName: secondLastName ?? '',
        phone: phone ?? '',
        businessName: businessName ?? '',
        rfc: rfc ?? '',
        email: email ?? '',
        street: street ?? '',
        exteriorNumber: exteriorNumber ?? '',
        interiorNumber: interiorNumber ?? '',
        zip: zip ?? '',
        stateCode: '',
        stateName: '',
        cityCode: '',
        cityName: '',
        currentNeighborhood: undefined,
        neighborhoods: undefined,
        voterID: voterID ?? ''
      },
      uiValues: {
        canSave: this.props.toEditBillingDataInfo?.businessName == '',
        snackMessage: '',
        openSnack: false,
        canDelete: false
      }
    }
    this.handleDelete = this.handleDelete.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.isAFieldInvalid = this.isAFieldInvalid.bind(this)
    this.handleFormValues = this.handleFormValues.bind(this)
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
    this.handleChangeUiValues = this.handleChangeUiValues.bind(this)

    if (zip != undefined) this.handleFormValues('zip', zip)
  }

  async handleFormValues(param, value) {
    let tempFormValues = { ...this.state.formValues }

    if (param === 'zip' && value.length === 5) {
      let { data } = await getDataAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        resource: 'locations',
        filters: {
          where: {
            zip: value
          },
          include: ['state', 'municipality', 'type']
        }
      })

      const currentNeighborhood = data.find((neighborhood) => neighborhood.locationMunicipalityStateCode === this.props.toEditBillingDataInfo?.locationCode)

      if (data.length > 0) {
        tempFormValues.stateCode = data[0].state.code
        tempFormValues.stateName = data[0].state.name
        tempFormValues.cityCode = data[0].municipality.code
        tempFormValues.cityName = data[0].municipality.name
        tempFormValues.currentNeighborhood = currentNeighborhood ?? undefined
        tempFormValues.neighborhoods = data
      }
    }

    if (param === 'zip' && value.length !== 5) {
      tempFormValues.stateCode = ''
      tempFormValues.stateName = ''
      tempFormValues.cityCode = ''
      tempFormValues.cityName = ''
      tempFormValues.currentNeighborhood = undefined
      tempFormValues.neighborhoods = []
    }

    if (param === 'currentNeighborhood') {
      let currentNeighborhoodIndex = value
      value = tempFormValues.neighborhoods[currentNeighborhoodIndex]
    }

    tempFormValues[param] = value

    this.setState({ formValues: tempFormValues }, () => {
    })

    const { name, lastName, secondLastName, phone, exteriorNumber, interiorNumber, street, zip, businessName, rfc, email, isLegalEntity, voterID } = this.props.toEditBillingDataInfo

    if (this.props.toEditBillingDataInfo?.businessName != '') {
      this.handleChangeUiValues(
        'canSave',
        exteriorNumber != tempFormValues.exteriorNumber ||
          interiorNumber != tempFormValues.interiorNumber ||
          street != tempFormValues.street ||
          zip != tempFormValues.zip ||
          this.props.toEditBillingDataInfo.locationCode.substring(0, 4) != tempFormValues.currentNeighborhood?.code ||
          businessName != tempFormValues.businessName ||
          rfc != tempFormValues.rfc ||
          email != tempFormValues.email ||
          isLegalEntity != tempFormValues.isLegalEntity ||
          name != tempFormValues.name ||
          lastName != tempFormValues.lastName ||
          secondLastName != tempFormValues.secondLastName ||
          phone != tempFormValues.phone ||
          voterID != tempFormValues.voterID
      )
    } else {
      this.handleChangeUiValues('canSave', true)
    }
  }

  handleChangeUiValues(param, value) {
    let tempUiValues = { ...this.state.uiValues }

    tempUiValues[param] = value

    this.setState({ uiValues: tempUiValues }, () => console.log(this.state.uiValues))
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleConfirm()
    }
  }

  async handleDelete() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'users',
      endpoint: '/bill/delete',
      data: {
        addressId: this.props.toEditBillingDataInfo?.addressId
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      await this.throwSnack('Datos eliminados correctamente')

      this.handleChangeUiValues('canDelete', true)
      this.handleChangeUiValues('canSave', false)

      setTimeout(this.props.loadBills, 3000)
    }
  }

  async handleConfirm() {
    this.handleChangeUiValues('canSave', false)
    if (!this.isAFieldInvalid()) {
      let response =
        this.props.toEditBillingDataInfo?.businessName != null && this.props.toEditBillingDataInfo?.businessName != ''
          ? await requestAPI({
              host: Utils.constants.CONFIG_ENV.HOST,
              method: 'PUT',
              resource: 'users',
              endpoint: '/bill/update',
              data: {
                name: this.state.formValues.name,
                lastName: this.state.formValues.lastName,
                secondLastName: this.state.formValues.secondLastName,
                phone: this.state.formValues.phone,
                voterID: this.state.formValues.voterID,
                zip: this.state.formValues.zip,
                stateCode: this.state.formValues.stateCode,
                municipalityCode: this.state.formValues.cityCode,
                locationCode: this.state.formValues.currentNeighborhood.code,
                street: this.state.formValues.street,
                exteriorNumber: this.state.formValues.exteriorNumber,
                interiorNumber: this.state.formValues.interiorNumber,
                businessName: this.state.formValues.businessName,
                rfc: this.state.formValues.rfc,
                email: this.state.formValues.email,
                addressId: this.props.toEditBillingDataInfo?.addressId,
                isLegalEntity: this.state.formValues.isLegalEntity === 'fisica' ? 0 : 1
              }
            })
          : await requestAPI({
              host: Utils.constants.CONFIG_ENV.HOST,
              method: 'POST',
              resource: 'users',
              endpoint: '/bill/create',
              data: {
                isLegalEntity: this.state.formValues.isLegalEntity === 'fisica' ? 0 : 1,
                name: this.state.formValues.name,
                lastName: this.state.formValues.lastName,
                secondLastName: this.state.formValues.secondLastName,
                phone: this.state.formValues.phone,
                businessName: this.state.formValues.businessName,
                rfc: this.state.formValues.rfc,
                email: this.state.formValues.email,
                street: this.state.formValues.street,
                exteriorNumber: this.state.formValues.exteriorNumber,
                interiorNumber: this.state.formValues.interiorNumber,
                zip: this.state.formValues.zip,
                stateCode: this.state.formValues.stateCode,
                municipalityCode: this.state.formValues.cityCode,
                locationCode: this.state.formValues.currentNeighborhood.code,
                voterID: this.state.formValues.voterID
              }
            })

      if (response.status === Utils.constants.status.SUCCESS) {
        this.throwSnack('Datos guardados correctamente')

        this.handleChangeUiValues('canDelete', true)

        setTimeout(this.props.loadBills, 3000)
      }
    }
  }

  isAFieldInvalid() {
    if (this.state.formValues.name.trim() === '') {
      this.throwSnack('Nombre no válido')
      return true
    }
    if (this.state.formValues.lastName.trim() === '') {
      this.throwSnack('Apellido paterno no válido')
      return true
    }
    if (this.state.formValues.secondLastName.trim() === '') {
      this.throwSnack('Apellido materno no válido')
      return true
    }
    if (this.state.formValues.phone.trim() === '') {
      this.throwSnack('Teléfono no válido')
      return true
    }

    if (this.state.formValues.businessName.trim() === '') {
      this.throwSnack('Razón social no válida')
      return true
    }

    if (this.state.formValues.rfc.trim() === '') {
      this.throwSnack('RFC no válido')
      return true
    }

    if (this.state.formValues.email.trim() === '' || !Utils.validateEmail(this.state.formValues.email.trim())) {
      this.throwSnack('Email no válido')
      return true
    }

    if (this.state.formValues.street.trim().length <= 0 || this.state.formValues.street.trim().length > 128) {
      this.throwSnack('Calle de la dirección incorrecta')
      return true
    }

    if (Number(this.state.formValues.exteriorNumber) <= 0 || this.state.formValues.exteriorNumber.length > 16) {
      this.throwSnack('Número exterior incorrecto')
      return true
    }

    if (Number(this.state.formValues.interiorNumber) <= 0 || this.state.formValues.interiorNumber.length > 16) {
      this.throwSnack('Número interior incorrecto')
      return true
    }

    if (this.state.formValues.zip.trim().length < 5 || Number(this.state.formValues.zip) <= 0) {
      this.throwSnack('Código postal incorrecto')
      return true
    }

    if (this.state.formValues.currentNeighborhood == undefined) {
      this.throwSnack('Colonia incorrecta')
      return true
    }

    if (this.state.formValues.voterID.trim() === '') {
      this.throwSnack('Credencial de elector no válida')
      return true
    }

    return false
  }

  handleSnackbarClose() {
    let tempUiValues = { ...this.state.uiValues }
    tempUiValues.openSnack = false
    this.setState({ uiValues: tempUiValues })
  }

  throwSnack(snackMessage) {
    let tempUiValues = { ...this.state.uiValues }
    tempUiValues.openSnack = true
    tempUiValues.snackMessage = snackMessage
    this.setState({ uiValues: tempUiValues })
  }

  render() {
    return (
      <Grid container spacing={2} style={{ paddingTop: 20 }}>
        <Grid item xs={12}>
          <form
            fullWidth
            noValidate
            autoComplete='off'
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                this.handleConfirm()
              }
            }}
          >
            <TaxDataTaxFormRadioGroup
              onChange={({ target: { value } }) => {
                this.handleFormValues('isLegalEntity', value)
              }}
              value={this.state.formValues.isLegalEntity}
            />

            <TaxDataFormField
              fieldName={'Nombre *'}
              fieldPlaceholder={'Nombre'}
              fieldValue={this.state.formValues.name}
              onChange={({ target: { value } }) => {
                if (value.length < 41) this.handleFormValues('name', value)
              }}
            />

            <TaxDataFormField
              fieldName={'Apellido paterno *'}
              fieldPlaceholder={'Apellido paterno'}
              fieldValue={this.state.formValues.lastName}
              onChange={({ target: { value } }) => {
                if (value.length < 41) this.handleFormValues('lastName', value)
              }}
            />

            <TaxDataFormField
              fieldName={'Apellido materno *'}
              fieldPlaceholder={'Apellido materno'}
              fieldValue={this.state.formValues.secondLastName}
              onChange={({ target: { value } }) => {
                if (value.length < 41) this.handleFormValues('secondLastName', value)
              }}
            />

            <TaxDataFormField
              fieldName={'Teléfono *'}
              fieldPlaceholder={'Teléfono'}
              fieldValue={this.state.formValues.phone}
              onChange={({ target: { value } }) => {
                if (value.length < 11) this.handleFormValues('phone', value)
              }}
              type='number'
            />

            <TaxDataFormField
              fieldName={'Razón social *'}
              fieldPlaceholder={'Razón social'}
              fieldValue={this.state.formValues.businessName}
              onChange={({ target: { value } }) => {
                if (value.length < 71) this.handleFormValues('businessName', value)
              }}
            />

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <TaxDataFormField
                  xsSize={6}
                  fieldName={'RFC *'}
                  fieldPlaceholder={'RFC'}
                  fieldValue={this.state.formValues.rfc}
                  onChange={({ target: { value } }) => {
                    if (value.length < 21) this.handleFormValues('rfc', value)
                  }}
                />
                <TaxDataFormField
                  xsSize={6}
                  fieldName={'Correo electrónico *'}
                  fieldPlaceholder={'Correo electrónico'}
                  fieldValue={this.state.formValues.email}
                  onChange={({ target: { value } }) => {
                    if (value.length < 61) this.handleFormValues('email', value)
                  }}
                />
              </Grid>
            </Grid>

            <TaxDataFormField
              fieldName={'Calle de la dirección *'}
              fieldPlaceholder={'Calle de la dirección'}
              fieldValue={this.state.formValues.street}
              onChange={({ target: { value } }) => this.handleFormValues('street', value)}
            />

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <TaxDataFormField
                  xsSize={6}
                  fieldName={'Número exterior *'}
                  fieldPlaceholder={'Número exterior'}
                  fieldValue={this.state.formValues.exteriorNumber}
                  onChange={({ target: { value } }) => {
                    if (value.length < 21) this.handleFormValues('exteriorNumber', value)
                  }}
                />
                <TaxDataFormField
                  xsSize={6}
                  fieldName={'Número interior'}
                  fieldPlaceholder={'Número interior'}
                  fieldValue={this.state.formValues.interiorNumber}
                  onChange={({ target: { value } }) => {
                    if (value.length < 21) this.handleFormValues('interiorNumber', value)
                  }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <TaxDataFormField
                  xsSize={6}
                  fieldName={'Código postal *'}
                  fieldPlaceholder={'Código postal'}
                  fieldValue={this.state.formValues.zip}
                  type='number'
                  onChange={({ target: { value } }) => {
                    if (value.length < 6) this.handleFormValues('zip', value)
                  }}
                />

                <TaxDataFormNeighborhoodSelect
                  onChange={({ target: { value } }) => this.handleFormValues('currentNeighborhood', value)}
                  neighborhoods={this.state.formValues.neighborhoods}
                  currentNeighborhood={this.state.formValues.currentNeighborhood}
                />
              </Grid>
            </Grid>

            {this.state.formValues.neighborhoods?.length > 0 ? (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant='body1'>
                      <strong>Municipio</strong>
                    </Typography>
                    <TextField fullWidth disabled={true} value={this.state.formValues.cityName} type='text' />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body1'>
                      <strong>Estado</strong>
                    </Typography>
                    <TextField fullWidth disabled={true} value={this.state.formValues.stateName} type='text' />
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              ''
            )}

            <TaxDataFormField
              fieldName={'Credencial de elector *'}
              fieldPlaceholder={'Credencial de elector'}
              fieldValue={this.state.formValues.voterID}
              onChange={({ target: { value } }) => {
                if (value.length < 31) this.handleFormValues('voterID', value)
              }}
            />

            {this.props.isFormInModal ? (
              <Grid container style={{ paddingTop: 20 }} spacing={2}>
                <Grid item xs={this.props.toEditBillingDataInfo?.businessName != null && this.props.toEditBillingDataInfo?.businessName != '' ? 4 : 6}>
                  <Button fullWidth variant='outlined' color='secondary' style={{ border: '2px solid' }} onClick={this.props.closeTaxDataModalForm}>
                    Cancelar
                  </Button>
                </Grid>
                {this.props.toEditBillingDataInfo?.businessName != null && this.props.toEditBillingDataInfo?.businessName != '' ? (
                  <Grid item xs={4}>
                    <Button
                      disabled={this.state.uiValues.canDelete}
                      fullWidth
                      variant='contained'
                      color='primary'
                      onClick={() =>
                        this.setState({
                          deleteTaxDataConfirmationDialog: true
                        })
                      }
                    >
                      Eliminar
                    </Button>
                    <Dialog open={this.state.deleteTaxDataConfirmationDialog}>
                      <DialogTitle>¿Desea eliminar la información fiscal?</DialogTitle>
                      <DialogContent>Al eliminar la información fiscal dejará de estar disponible para generar facturas</DialogContent>
                      <DialogActions>
                        <Button
                          variant='outlined'
                          color='secondary'
                          style={{ border: '2px solid' }}
                          onClick={() =>
                            this.setState({
                              deleteTaxDataConfirmationDialog: false
                            })
                          }
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant='contained'
                          color='primary'
                          onClick={() => {
                            this.setState({
                              deleteTaxDataConfirmationDialog: false
                            })
                            this.handleDelete()
                          }}
                        >
                          Eliminar
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
                ) : (
                  ''
                )}

                <Grid item xs={this.props.toEditBillingDataInfo?.businessName != null && this.props.toEditBillingDataInfo?.businessName != '' ? 4 : 6}>
                  <Button disabled={!this.state.uiValues.canSave} fullWidth variant='contained' color='primary' onClick={this.handleConfirm}>
                    Guardar
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid item xs={12} style={{ paddingTop: 20 }}>
                <Button disabled={!this.state.uiValues.canSave} fullWidth variant='contained' color='primary' onClick={this.handleConfirm}>
                  Guardar
                </Button>
              </Grid>
            )}
          </form>
        </Grid>
        <Snackbar
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.uiValues.openSnack}
          onClose={this.handleCloseSnackbar}
          message={<span>{this.state.uiValues.snackMessage}</span>}
          action={[
            <IconButton key='close' aria-label='Close' color='inherit' onClick={this.handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          ]}
        />
      </Grid>
    )
  }
}
