import React, { Component } from 'react'

//material
import { Grid, Typography, Button, Card, CardContent, Modal, Radio } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

//components
import Empty from '../components/Empty'
import Router from 'next/router'

//utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'

import TaxDataForm from './TaxDataForm'

const styles = (theme) => ({
  expandButton: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    textDecoration: 'none',
  },
  buttonText: {
    color: '#499dd8',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    marginRight: '16px',
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      marginRight: '0px'
    }
  }
})

class MyTaxData extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isTaxDataLoaded: false,
      loadedBillingInfo: [],
      openNewTaxDataModal: false,
      toEditBillingDataInfo: {
        isLegalEntity: 'fisica',
        name: '',
        lastName: '',
        secondLastName: '',
        phone: '',
        businessName: '',
        email: '',
        exteriorNumber: '',
        interiorNumber: '',
        locationCode: '',
        rfc: '',
        street: '',
        zip: '',
        addressId: '',
        voterID: ''
      }
    }

    this.loadBills = this.loadBills.bind(this)
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState(
        {
          user: user
        },
        () => {
          this.loadBills()
        }
      )
    } else {
      Router.push('/')
    }
  }

  async loadBills() {
    let billingData = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/bill'
    })

    if (billingData.status === Utils.constants.status.SUCCESS)
      this.setState({
        isTaxDataLoaded: true,
        loadedBillingInfo: [...billingData.data],
        openNewTaxDataModal: false,
        toEditBillingDataInfo: {
          isLegalEntity: 'fisica',
          name: '',
          lastName: '',
          secondLastName: '',
          phone: '',
          businessName: '',
          email: '',
          exteriorNumber: '',
          interiorNumber: '',
          locationCode: '',
          rfc: '',
          street: '',
          zip: '',
          addressId: '',
          voterID: ''
        }
      })
  }

  render() {
    const { classes } = this.props

    return (
      <Grid container>
        {this.state.isTaxDataLoaded ? (
          this.state.loadedBillingInfo.length === 0 ? (
            <TaxDataForm loadBills={this.loadBills} toEditBillingDataInfo={this.state.toEditBillingDataInfo} />
          ) : (
              <Grid container justify='center'>
                {this.state.loadedBillingInfo.map((billingInfo, index) => (
                  <Grid item xs={12}>
                    <Card key={index} style={{ marginTop: 20 }}>
                      <CardContent>
                        <Grid container justify='center' alignItems='center'>
                          <Grid item xs={10}>
                            <Typography>
                              <strong>{billingInfo.rfc}</strong>
                            </Typography>
                            <Typography>{billingInfo.businessName}</Typography>
                            <Typography>{billingInfo.email}</Typography>
                            <Grid item xs={12}>
                              <button
                                className={classes.expandButton}
                                onClick={() => {
                                  this.setState({
                                    openNewTaxDataModal: true,
                                    toEditBillingDataInfo: {
                                      name: billingInfo.name,
                                      lastName: billingInfo.lastName,
                                      secondLastName: billingInfo.secondLastName,
                                      phone: billingInfo.phone,
                                      voterID: billingInfo.voterID,
                                      businessName: billingInfo.businessName,
                                      email: billingInfo.email,
                                      exteriorNumber: billingInfo.exteriorNumber,
                                      interiorNumber: billingInfo.interiorNumber,
                                      locationCode: billingInfo.locationCode,
                                      rfc: billingInfo.rfc,
                                      street: billingInfo.street,
                                      zip: billingInfo.zip,
                                      addressId: billingInfo.id,
                                      isLegalEntity: billingInfo.isLegalEntity === 0 ? 'fisica' : 'moral'
                                    }
                                  })
                                }}
                              >
                                <Typography className={classes.buttonText}>
                                  Editar
                              </Typography>
                              </button>

                            </Grid>

                          </Grid>
                          <Grid item xs={1} style={{ display: 'flex', justifyContent: 'flex-end' }} >
                            <Radio
                              checked={true}
                              // onChange={handleChange}
                            />

                          </Grid>

                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                <Grid item xs={6} style={{ marginTop: 20 }} alignItems='center'>
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      this.setState({ openNewTaxDataModal: true })
                    }}
                  >
                    Agregar nuevos datos fiscales
                </Button>
                </Grid>
              </Grid>
            )
        ) : (
            <Empty isLoading={true} title='Cargando...' description='Espere un momento...' />
          )}
        <Modal
          open={this.state.openNewTaxDataModal}
          //onClose={handleClose}
          aria-labelledby='simple-modal-title'
          aria-describedby='simple-modal-description'
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'scroll' }}
        >
          <Card style={{ width: '80%', top: '25%', margin: 'auto' }}>
            <CardContent>
              <Typography variant='h5'>
                <strong>Datos fiscales</strong>
              </Typography>
              <TaxDataForm
                loadBills={this.loadBills}
                closeTaxDataModalForm={() =>
                  this.setState({
                    openNewTaxDataModal: false,
                    toEditBillingDataInfo: {
                      name: '',
                      lastName: '',
                      secondLastName: '',
                      phone: '',
                      businessName: '',
                      email: '',
                      exteriorNumber: '',
                      interiorNumber: '',
                      rfc: '',
                      street: '',
                      zip: '',
                      locationCode: '',
                      isLegalEntity: 'fisica',
                      voterID: ''
                    }
                  })
                }
                isFormInModal={true}
                toEditBillingDataInfo={this.state.toEditBillingDataInfo}
              />
            </CardContent>
          </Card>
        </Modal>
      </Grid>
    )
  }
}

export default withStyles(styles)(MyTaxData)
