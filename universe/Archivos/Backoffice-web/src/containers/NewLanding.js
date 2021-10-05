'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'

// Components
import NotFound from './NotFound'
import Title from '../components/Title'
import CreateNewBlockModal from '../components/CreateNewBlockModal'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import { Paper, Button } from '@material-ui/core'
import CreateBannerBlock from '../components/CreateBannerBlock'
import DeleteDialog from '../components/DeleteDialog'
import CreateCarouselBlock from '../components/CreateCarouselBlock'
import CreateContainerBlock from '../components/CreateContainerBlock'
import CreateBannerGridBlock from '../components/CreateBannerGridBlock'
import CreateCountdownBlock from '../components/CreateCountdownBlock'
import CreateProductsBlock from '../components/CreateProductsBlock'
import CreateTextBlock from '../components/CreateTextBlock'
import CreateGridBlock from '../components/CreateGridBlock'
import CreateBenefitsBlock from '../components/CreateBenefitsBlock'
import CreateNewsletterBlock from '../components/CreateNewsletterBlock'

const styles = theme => ({
  buttonIcon: {
    float: 'right'
  }
})

class NewLanding extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
      options: null,
      openDeleteDialog: false,
      openCreateNewBlockModal: false,
      openCreateBannerGridBlock: false,
      openCreateBannerBlock: false,
      openCreateCarouselBlock: false,
      openCreateContainerBlock: false,
      openCreateCountdownBlock: false,
      openCreateProductsBlock: false,
      openCreateTextBlock: false,
      openCreateGridBlock: false,
      openCreateBenefitsBlock: false,
      openCreateNewsletterBlock: false,
      editBlock: false,
      selectedBlock: null
    }

    this.loadData = this.loadData.bind(this)
    this.executeQuery = this.executeQuery.bind(this)
    this.getBlockType = this.getBlockType.bind(this)
    this.createNewBlock = this.createNewBlock.bind(this)
    this.editBlock = this.editBlock.bind(this)
    this.deleteBlock = this.deleteBlock.bind(this)
    this.changePositionBlock = this.changePositionBlock.bind(this)
  }

  createNewBlock() {
    this.setState({
      openCreateNewBlockModal: true
    })
  }

  editBlock(item) {
    if (item.blockTypeId === Utils.constants.blocks.BANNER_GRID_BLOCK) {
      this.setState({
        openCreateBannerGridBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.BANNER_BLOCK) {
      this.setState({
        openCreateBannerBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.CAROUSEL_BLOCK) {
      this.setState({
        openCreateCarouselBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.CONTAINER_BLOCK) {
      this.setState({
        openCreateContainerBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.COUNTDOWN_BLOCK) {
      let eventDate = item.configs.eventDate.toString()
      let formattedActualEventDate = `${eventDate.slice(0, 4)}-${eventDate.slice(5, 7)}-${eventDate.slice(8, 10)}`
      let formattedActualEventTime = eventDate.slice(11, 16)

      item.actualEventDate = formattedActualEventDate
      item.actualEventTime = formattedActualEventTime

      this.setState({
        openCreateCountdownBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.FILTER_BLOCK) {
      this.setState({
        openCreateProductsBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.TEXT_BLOCK) {
      this.setState({
        openCreateTextBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.GRID_BLOCK) {
      this.setState({
        openCreateGridBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.BENEFITS_BLOCK) {
      this.setState({
        openCreateBenefitsBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    } else if (item.blockTypeId === Utils.constants.blocks.NEWSLETTER_BLOCK) {
      this.setState({
        openCreateNewsletterBlock: true,
        editBlock: true,
        selectedBlock: item
      })
    }
  }

  async deleteBlock(item, idx) {
    let data = this.state.data
    data.deleteLandingBlock = true
    data.item = item

    this.setState({
      data: data,
      openDeleteDialog: true,
      selectedBlock: item
    })
  }

  async changePositionBlock(item, direction) {
    const self = this

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'PATCH',
      resource: 'landings',
      endpoint: '/block/position',
      data: {
        landingId: this.props.match.params.id,
        id: item.id,
        direction: direction
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.changed) {
        this.setState({
          openSnack: true,
          messageSnack: 'Posición modificada con éxito.'
        }, () => {
          self.loadData()
        })
      }
    }
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async loadData() {
    const self = this
    let user = await Utils.getCurrentUser()
    let availableBlocks = []

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'landings',
      endpoint: '/' + this.props.match.params.id + '/entity'
    })

    let options = null

    if (this.state.options === undefined || this.state.options === null) {
      let optionsResponse = await requestAPI({
        host: Utils.constants.HOST,
        resource: 'blocks',
        endpoint: '/options',
        method: 'GET'
      })

      if (optionsResponse.data !== undefined) {
        options = optionsResponse.data
      }
    } else {
      options = this.state.options
    }

    if (response.data !== undefined && response.data !== null) {
      response.data["deleteLandingBlock"] = false

      availableBlocks = response.data.blocks.filter((block, idx) => {
        if (block.status) {
          if (block.blockTypeId === Utils.constants.blocks.FILTER_BLOCK) {
            self.executeQuery(block, idx)
          }
          return true
        } else {
          return false
        }
      })

      response.data.blocks = availableBlocks

      this.setState({
        loading: false,
        showData: (response.data.blocks > 0) ? true : false,
        user: user,
        data: response.data,
        options: options
      }, () => {
        if (self.props.match.path === Utils.constants.paths.newLandingBlock) {
          self.setState({
            openCreateNewBlockModal: true
          })
        }
        else if (self.props.match.path === Utils.constants.paths.createLandingBlock) {
          if (Number(self.props.match.params.blockId) === Utils.constants.blocks.BANNER_GRID_BLOCK) {
            self.setState({
              openCreateBannerGridBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.BANNER_BLOCK) {
            self.setState({
              openCreateBannerBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.CAROUSEL_BLOCK) {
            self.setState({
              openCreateCarouselBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.CONTAINER_BLOCK) {
            self.setState({
              openCreateContainerBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.COUNTDOWN_BLOCK) {
            self.setState({
              openCreateCountdownBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.FILTER_BLOCK) {
            self.setState({
              openCreateProductsBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.TEXT_BLOCK) {
            self.setState({
              openCreateTextBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.GRID_BLOCK) {
            self.setState({
              openCreateGridBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.BENEFITS_BLOCK) {
            self.setState({
              openCreateBenefitsBlock: true
            })
          } else if (Number(self.props.match.params.blockId) === Utils.constants.blocks.NEWSLETTER_BLOCK) {
            self.setState({
              openCreateNewsletterBlock: true
            })
          }
        }
        else if (self.props.match.path === Utils.constants.paths.editLandingBlock) {
          let selectedBlock = Utils.search(self.state.data.blocks, { id: self.props.match.params.blockId })
          if (selectedBlock[0].blockTypeId === Utils.constants.blocks.BANNER_GRID_BLOCK) {
            self.setState({
              openCreateBannerGridBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          }
          else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.BANNER_BLOCK) {
            self.setState({
              openCreateBannerBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.CAROUSEL_BLOCK) {
            self.setState({
              openCreateCarouselBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.COUNTDOWN_BLOCK) {
            self.setState({
              openCreateCountdownBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.FILTER_BLOCK) {
            self.setState({
              openCreateProductsBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.TEXT_BLOCK) {
            self.setState({
              openCreateTextBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.GRID_BLOCK) {
            self.setState({
              openCreateGridBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.BENEFITS_BLOCK) {
            self.setState({
              openCreateBenefitsBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          } else if (selectedBlock[0].blockTypeId === Utils.constants.blocks.NEWSLETTER_BLOCK) {
            self.setState({
              openCreateNewsletterBlock: true,
              editBlock: true,
              selectedBlock: selectedBlock[0]
            })
          }
        }
      })
    }
  }

  async executeQuery(item, idx) {
    let response = await requestAPI({
      host: Utils.constants.HOST_API_ECOMMERCE,
      method: 'POST',
      resource: 'users',
      endpoint: '/products/query',
      data: {
        data: {
          query: item.configs.query
        }
      }
    })
    if (response.status === 200) {
      let data = this.state.data
      if (data.blocks[idx] !== undefined) {
        data.blocks[idx].queryCount = response.data.length
        this.setState({
          data: data
        })
      }
    }
  }

  async componentWillMount() {
    this.loadData()
  }

  getBlockType(item) {
    if (item.blockTypeId === 1) {
      return 'Text Block'
    } else if (item.blockTypeId === 2) {
      return 'Grid Block'
    } else if (item.blockTypeId === 3) {
      return 'Grid Banner Block'
    } else if (item.blockTypeId === 4) {
      return 'Banner Block'
    }/* else if (item.blockTypeId === 5) {
      return 'Bloque marcas'
    } else if (item.blockTypeId === 6) {
      return 'Bloque categorías random'
    }*/ else if (item.blockTypeId === 7) {
      return 'Benefit Block'
    } else if (item.blockTypeId === 8) {
      return 'Newsletter Block'
    }/* else if (item.blockTypeId === 9) {
      return 'Bloque new popular'
    } else if (item.blockTypeId === 10) {
      return 'Carousel Block'
    }/* else if (item.blockTypeId === 11) {
      return 'Bloque new banner'
    } else if (item.blockTypeId === 12) {
      return 'Bloque top ventas'
    } else if (item.blockTypeId === 13) {
      return 'Bloque soporte'
    } else if (item.blockTypeId === 14) {
      return 'Bloque vistos recientemente'
    }*/ else if (item.blockTypeId === 15) {
      return 'Carrousel Block'
    }/* else if (item.blockTypeId === 16) {
      return 'Compra por categoría'
    }*/ else if (item.blockTypeId === 17) {
      return 'Coutdown Block'
    }/* else if (item.blockTypeId === 18) {
      return 'Bloque tipo contenedor'
    }*/ else if (item.blockTypeId === 22) {
      return 'Products Block'
    }
  }

  render() {

    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Landings

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={6} lg={8} md={4} sm={12} xs={12}>
              <Title
                title={(this.state.data.url !== undefined) ? 'Landing page: ' + this.state.data.url : ''}
                description="Configuración de contenido."
              />
            </Grid>
            <Grid item xl={3} lg={2} md={4} sm={6} xs={12}>
              <Button onClick={() => { this.props.history.push('/landings') }} style={{ fontWeight: 900, marginTop: 16, width: '100%' }}>Regresar</Button>
            </Grid>
            <Grid item xl={3} lg={2} md={4} sm={6} xs={12}>
              <Button
                disabled={(this.state.options === null)}
                onClick={() => { this.createNewBlock() }}
                color="primary"
                variant="contained"
                style={{ fontWeight: 900, marginTop: 16, width: '100%' }}>CREAR NUEVO BLOQUE</Button>
            </Grid>
          </Grid>
          {
            (!this.state.loading) ?
              (this.state.data.blocks.length > 0) ?
                <Grid container>
                  {
                    this.state.data.blocks.map((item, idx) => {
                      return (
                        <div style={{ width: '100%' }}>
                          <Paper style={{ margin: '8px 0', padding: 24 }}>
                            <Grid container>
                              <Grid item xl={9} lg={8} md={9} sm={9} xs={9}>
                                <Typography variant="body1">{item.identifier}</Typography>
                                <Typography variant="body2"><strong>{self.getBlockType(item)}</strong></Typography>
                                {
                                  (item.blockTypeId === Utils.constants.blocks.FILTER_BLOCK && this.state.data.blocks[idx].queryCount !== undefined && item.v !== undefined && item.v === '2.0') ?
                                    <Typography variant="body1">Productos: {this.state.data.blocks[idx].queryCount}</Typography>
                                    :
                                    ''
                                }
                                {
                                  ((item.blockTypeId === Utils.constants.blocks.BANNER_BLOCK || item.blockTypeId === Utils.constants.blocks.BANNER_GRID_BLOCK || item.blockTypeId === Utils.constants.blocks.BANNER_GRID_BLOCK) && item.v !== undefined && item.v === '2.0') ?
                                    <>
                                      <Typography variant="body1">Cantidad banners: {item.configs.banners.length}</Typography>
                                      <Typography variant="body1">Peso total: {Utils.numberWithCommas((item.configs.totalSize / 1000).toFixed(2))} KB.</Typography>
                                    </>
                                    :
                                    ''
                                }
                                {
                                  ((item.blockTypeId === Utils.constants.blocks.CAROUSEL_BLOCK) && item.v !== undefined && item.v === '2.0') ?
                                    <>
                                      <Typography variant="body1">Cantidad items: {item.configs.items.length}</Typography>
                                      <Typography variant="body1">Peso total: {Utils.numberWithCommas((item.configs.totalSize / 1000).toFixed(2))} KB.</Typography>
                                    </>
                                    :
                                    ''
                                }
                                {
                                  ((item.blockTypeId === Utils.constants.blocks.GRID_BLOCK) && item.v !== undefined && item.v === '2.0') ?
                                    <>
                                      <Typography variant="body1">Columnas: {item.configs.grid.length}</Typography>
                                      <Typography variant="body1">Peso total: {Utils.numberWithCommas((item.configs.totalSize / 1000).toFixed(2))} KB.</Typography>
                                    </>
                                    :
                                    ''
                                }
                                {
                                  ((item.blockTypeId === Utils.constants.blocks.COUNTDOWN_BLOCK) && item.v !== undefined && item.v === '2.0') ?
                                    <>
                                      <Typography variant="body1">Peso total: {Utils.numberWithCommas((item.configs.totalSize / 1000).toFixed(2))} KB.</Typography>
                                    </>
                                    :
                                    ''
                                }
                              </Grid>
                              <Grid item xl={3} lg={4} md={3} sm={3} xs={3}>
                                {
                                  (item.blockTypeId === Utils.constants.blocks.BANNER_GRID_BLOCK || item.blockTypeId === Utils.constants.blocks.CAROUSEL_BLOCK || item.blockTypeId === Utils.constants.blocks.BANNER_BLOCK || item.blockTypeId === Utils.constants.blocks.COUNTDOWN_BLOCK || item.blockTypeId === Utils.constants.blocks.FILTER_BLOCK || item.blockTypeId === Utils.constants.blocks.TEXT_BLOCK || item.blockTypeId === Utils.constants.blocks.GRID_BLOCK || item.blockTypeId === Utils.constants.blocks.VIDEO_BLOCK) ?
                                    <div>
                                      <IconButton className={classes.buttonIcon} onClick={() => { self.deleteBlock(item, idx) }}><Icon>delete</Icon></IconButton>
                                      {
                                        (item.v !== undefined && item.v === '2.0') ?
                                          <IconButton className={classes.buttonIcon} onClick={() => { self.editBlock(item) }}><Icon>edit</Icon></IconButton>
                                          :
                                          ''
                                      }
                                    </div>
                                    :
                                    ''
                                }
                                {
                                  (idx !== 0) ?
                                    <IconButton className={classes.buttonIcon} onClick={() => { self.changePositionBlock(item, 'UP') }}><Icon>keyboard_arrow_up</Icon></IconButton>
                                    :
                                    ''
                                }
                                {
                                  (idx !== this.state.data.blocks.length - 1) ?
                                    <IconButton className={classes.buttonIcon} onClick={() => { self.changePositionBlock(item, 'DOWN') }}><Icon>keyboard_arrow_down</Icon></IconButton>
                                    :
                                    ''
                                }
                              </Grid>
                            </Grid>
                          </Paper>
                        </div>
                      )
                    })
                  }
                </Grid>
                :
                <Empty
                  title="¡Sin bloques!"
                  description="No hay bloques para mostrar."
                />
              :
              <Empty
                isLoading={this.state.loading}
                title="Cargando bloques..."
                description="Espere un momento por favor."
              />
          }
          <CreateNewBlockModal
            open={this.state.openCreateNewBlockModal}
            landing={true}
            handleClose={() => {
              this.setState({
                openCreateNewBlockModal: false,
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={(selection) => {
              if (selection !== null) {
                if (selection === Utils.constants.blocks.BANNER_GRID_BLOCK) {
                  this.setState({
                    openCreateBannerGridBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.BANNER_BLOCK) {
                  this.setState({
                    openCreateBannerBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.CAROUSEL_BLOCK) {
                  this.setState({
                    openCreateCarouselBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.CONTAINER_BLOCK) {
                  this.setState({
                    openCreateContainerBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.COUNTDOWN_BLOCK) {
                  this.setState({
                    openCreateCountdownBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.FILTER_BLOCK) {
                  this.setState({
                    openCreateProductsBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.TEXT_BLOCK) {
                  this.setState({
                    openCreateTextBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.GRID_BLOCK) {
                  this.setState({
                    openCreateGridBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.BENEFITS_BLOCK) {
                  this.setState({
                    openCreateBenefitsBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                } else if (selection === Utils.constants.blocks.NEWSLETTER_BLOCK) {
                  this.setState({
                    openCreateNewsletterBlock: true,
                    openCreateNewBlockModal: false
                  }, () => {
                    self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                  })
                }
              } else {
                this.setState({
                  openCreateNewBlockModal: false,
                }, () => {
                  self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
                })
              }
            }}
          />

          <CreateBannerGridBlock
            open={this.state.openCreateBannerGridBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateBannerGridBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateBannerGridBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateBannerBlock
            open={this.state.openCreateBannerBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateBannerBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateBannerBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateCarouselBlock
            open={this.state.openCreateCarouselBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateCarouselBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateCarouselBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateContainerBlock
            open={this.state.openCreateContainerBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateContainerBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateContainerBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateCountdownBlock
            open={this.state.openCreateCountdownBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateCountdownBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateCountdownBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateProductsBlock
            open={this.state.openCreateProductsBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            options={this.state.options}
            handleClose={() => {
              this.setState({
                openCreateProductsBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateProductsBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateTextBlock
            open={this.state.openCreateTextBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateTextBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateTextBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateGridBlock
            open={this.state.openCreateGridBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateGridBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateGridBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateBenefitsBlock
            open={this.state.openCreateBenefitsBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateBenefitsBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateBenefitsBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <CreateNewsletterBlock
            open={this.state.openCreateNewsletterBlock}
            landing={true}
            editBlock={this.state.editBlock}
            selectedBlock={this.state.selectedBlock}
            handleClose={() => {
              this.setState({
                openCreateNewsletterBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
            handleCloseWithData={() => {
              this.setState({
                openCreateNewsletterBlock: false,
                editBlock: false,
                selectedBlock: null
              }, () => {
                self.loadData()
                self.props.history.push('/landings/' + this.props.match.params.id + '/bloques')
              })
            }}
          />

          <DeleteDialog
            open={this.state.openDeleteDialog}
            host={Utils.constants.HOST}
            resource="landings"
            data={this.state.data}
            title="Deshabilitar bloque."
            description={
              <Typography variant="body1">¿Desea deshabilitar el bloque <i>{(this.state.selectedBlock !== null && !Utils.isEmpty(this.state.selectedBlock.identifier)) ? ' ' + this.state.selectedBlock.identifier : ''}</i>?</Typography>
            }
            onCancel={() => {
              let data = this.state.data

              data.blocks.forEach((block, idx) => {
                if (block.id === this.state.selectedBlock.id) {
                  this.state.data.blocks[idx].status = true
                }
              })

              this.setState({
                data: data,
                openDeleteDialog: false
              })
            }}
            onConfirm={() => {
              const self = this
              this.setState({
                openDeleteDialog: false
              }, () => {
                self.loadData()
              })
            }}
          />


          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        </div>
      )
    }
    else {
      return (
        <NotFound />
      )
    }
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(NewLanding)
