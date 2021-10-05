import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//material
import { Grid, Typography, Checkbox, Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'


//components
import Empty from '../components/Empty'
import CardModal from './CardModal'
import DeleteDialog from './DeleteDialog'

//utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import Router from 'next/router'

const styles = theme => ({
  addressBox: {
    backgroundColor: "white",
    margin: "16px 0px 16px 0px",
    border: "2px solid #E0E0E0",
    borderRadius: "10px",
    padding: "20px 20px 20px 20px",
    [theme.breakpoints.down('xs')]: {
      padding: "8px",
    }
  },
  expandButton: {
    border: "none",
    backgroundColor: "transparent"
  },
  buttonText: {
    cursor: 'pointer',
    backgroundColor: "transparent",
    color: '#1F2B4E',
    textDecoration: 'underline',
    border: "none",
    marginRight: "16px",
    fontSize: 16,
    '&:hover': {
      color: "#0076BD"
    },
    [theme.breakpoints.down('xs')]: {
      marginRight: "0px",
    }
  },
  sendHereButton: {
    backgroundColor: "white",
    marginTop: "8px",
    color: "#283A78",
    border: "2px solid #283A78",
    width: "100%",
  },
  chkBox: {
    margin: "0px 0px 0px 0px",
    padding: "8px 0px 0px 0px"
  },
  root: {
    maxWidth: 800,
    [theme.breakpoints.down('sm')]: {
      margin: '0 auto',
    }
  }
})

class MyCards extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openAddCardModal: false,
      openDeleteCard: false,
      editCard: false,
      card: {},
      config: {
        cards: []
      },
      cardImage: ''

    }
    this.loadData = this.loadData.bind(this)
    this.handleChangeCard = this.handleChangeCard.bind(this)
    this.getImageByCardType = this.getImageByCardType.bind(this)

  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.loadData()
      this.state.config.cards = []
    } else {
      Router.push('/')
    }
  }

  async loadData() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'orders',
      endpoint: '/checkout',
      data: {
        isCredit: true,
        coupon: ''
      }
    })
    // Cambiar a cuando sea correcto
    if (response.status === 500) {
      Router.push('/ingreso')
    } else {
      this.setState({
        config: response.data
      })
    }
  }
  handleChangeCard(card) {
    let config = this.state.config
    config.cards.forEach((item, idx) => {
      item.checked = false
      if (item.id === card.id) {
        config.cards[idx].checked = true
      }
    })

    this.setState({
      config: config
    })
  }

  getImageByCardType(card) {
    let image = ''
    if (card.type === 'visa') {
      image = '/logos_visa.svg'
    } else if (card.type === 'mastercard') {
      image = '/mastercard.png'
    } else {
      image = '/amex.png'
    }
    card.image = image
  }

  render() {
    const self = this
    const { classes } = this.props
    return (<Grid style={{ height: '50vh' }} className={classes.root}>
      {
        // Validación de tarjetas, preguntar si hay tarjetas
        (self.state.config.cards.length !== 0) ?
          <div>
            <Grid container className={classes.addressBox} >
              <Grid item xs={8}>
                <Typography variant='subtitle' style={{ fontSize: '20px' }} >Nueva tarjeta</Typography>
              </Grid>
              <Grid item xs={4}>
                <Button onClick={() => self.setState({ openAddCardModal: true })} style={{ display: 'block', marginLeft: 'auto', width: 100, borderRadius: '50px' }} variant="contained" color="primary">Agregar</Button>
              </Grid>
            </Grid>
            {
              self.state.config.cards.map(card => {
                return (
                  <Grid container>
                    <Grid items xs={12} >
                      <Grid container className={classes.addressBox} >
                        <Grid item xs={11}>
                          {
                            this.getImageByCardType(card)
                          }
                          <img alt="" src={card.image} style={{ width: '50px', height: '20px' }} />
                          <Typography>{'**** ' + card.number}</Typography>
                          <Typography variant='subtitle2' color="textSecondary" >{card.alias} </Typography>
                          <Grid container >
                            <Button onClick={() => {
                              self.setState({
                                openAddCardModal: true,
                                editCard: true,
                                card: card
                              })
                            }} color="primary">Editar</Button>
                            <Button
                              onClick={() => {
                                self.setState({
                                  openDeleteCard: true,
                                  card: card
                                })
                              }}
                              style={{ color: '#e3001b' }} >Eliminar</Button>
                          </Grid>
                        </Grid>
                        <Grid style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }} item xs={1}>
                          <Checkbox
                            checked={card.checked}
                            value="secondary"
                            color="primary"
                            className={classes.chkBox}
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                            onChange={() => { self.handleChangeCard(card) }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                  </Grid>
                )
              })

            }
          </div>

          :
          // Cuando no haya tarjetas
          <div>

            <Empty
              emptyImg='unsuccessfull.svg'
              title='No hay tarjetas agregadas'
              description='Aquí aparecerán las tarjetas agregadas a tu cuenta para que pagues mas fácil y sencillo.'
              buttonTitle='Agregar tarjeta'
              cardsButton={true}
              callToAction={() => { this.setState({ openAddCardModal: true }) }}
            />
          </div>
      }

      <CardModal
        open={this.state.openAddCardModal}
        editCard={this.state.editCard}
        card={this.state.card}
        handleCloseWithCard={(card) => {
          if (!this.state.editCard) {
            const self = this
            let config = this.state.config
            card.checked = true
            config.cards.push(card)
            this.setState({
              openAddCardModal: false,
              editCard: false,
              card: null,
              config: config
            }, () => {
              self.handleChangeCard(card)
            })
          } else {
            this.setState({
              openAddCardModal: false,
              editCard: false,
              card: null,
            })
          }
        }}
        handleClose={() => {
          this.setState({
            openAddCardModal: false,
            editCard: false,
            card: null
          })
        }}
      />

      <DeleteDialog
        open={this.state.openDeleteCard}
        title="Eliminar tarjeta."
        description={
          (this.state.card !== null) ?
            <Typography variant="body1">¿Deseas eliminar la tarjeta con terminación: <strong>{this.state.card.number}</strong>?</Typography>
            :
            ''
        }
        host={Utils.constants.CONFIG_ENV.HOST}
        resource="cards"
        data={this.state.card}
        onCancel={() => {
          this.setState({
            openDeleteCard: false,
            card: null
          })
        }}
        onConfirm={(card) => {
          let config = this.state.config
          let cards = []
          config.cards.forEach(item => {
            if (item.id !== this.state.card.id) {
              cards.push(item)
            }
          })
          config.cards = cards
          this.setState({
            openDeleteCard: false,
            card: null,
            config: config
          })
        }}
      />

    </Grid>
    )
  }
}
const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(MyCards)
