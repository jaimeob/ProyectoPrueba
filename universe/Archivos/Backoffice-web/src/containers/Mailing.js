import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import moment from 'moment'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'
import NewEmailModal from '../components/NewEmailModal'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'

const styles = theme => ({

})

class Mailing extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openModal: false,
            openSnack: false,
            messageSnack: '',
            loading: false,
            showData: false,
            user: null,
            data: [],
            mails: [],
            mailSelected:[]
        }
        this.loadData = this.loadData.bind(this)
        this.handleMailsActions = this.handleMailsActions.bind(this)
        this.getMailsActions = this.getMailsActions.bind(this)
        this.getEmailByid = this.getEmailByid.bind(this)
    }

    async searchQuery(data) {
        this.setState({
            loading: true
        })

        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'POST',
            resource: '/mailings',
            endpoint: '/emails',
            data: { campaign: data }
        })

        if (response.data.length > 0 && response.data !== null) {
            this.setState({
                mails: response.data
            })
        }

    }

    async loadData() {

        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'POST',
            resource: '/mailings',
            endpoint: '/emails'
        })

        if (response.data != undefined && response.data.length > 0) {
            let mailsArray = response.data

            this.setState({
                mails: mailsArray
            })
        }
    }

    async componentWillMount() {
        this.loadData()
    }

    componentDidMount() {
        Utils.scrollTop()
    }

    async getEmailByid(id) {
        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'POST',
            resource: '/mailings',
            endpoint: '/mail',
            data:{id}
        })


        if (response.data != undefined && !Utils.isEmpty(response.data )) {

            this.setState({
                mailSelected: response.data
            })
            return response.data
        }
    }

    async handleMailsActions(item, action) {
        let key = action.key
        
        if (key === 'see_review') {
            let mail = await this.getEmailByid(item._id)
            if (mail !== undefined && mail !== null) {
                this.setState({
                    openModal: true
                })
            }
        }


    }

    getMailsActions(item) {
        if (item !== undefined) {

            return [
                {
                    "icon": 'visibility',
                    "code": 'read',
                    "name": 'Ver detalle',
                    "key": 'see_review',
                    "pipeline": []
                }
            ]

        } else {
            return []
        }
    }



    render() {
        const { classes } = this.props
        const self = this
        const module = Utils.app().modules.Mailing

        //console.log(this.state.mails, "MAILS")

        if (module.permissions.read) {
            return (
                <div>
                    <Grid container>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Title title="Envio de correos." />
                        </Grid>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
                            <Head
                                searchPlaceholder="Buscar campaña."
                                titleButtonCreate="Crear mail"
                                searchQuery={(data) => { this.searchQuery(data) }}
                                callToCreate={(module.permissions.create) ? (() => { this.setState({ openModal: true, mailSelected:[] }) }) : false}
                            />
                        </Grid>

                    </Grid>
                    {
                        (this.state.mails.length <= 0) ?
                            <Empty
                                isLoading={this.state.loading}
                                title="Cargando emails..."
                                description="Espere un momento por favor."
                            />
                            : (this.state.mails.length > 0) ?
                                <Grid container>
                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                        <br />
                                        <div>
                                            {
                                                // (this.state.showData) ?
                                                <TableCRUD
                                                    //user={this.state.user}
                                                    module={module}
                                                    data={this.state.mails}
                                                    actionsFunction={(item) => this.getMailsActions(item)}
                                                    handleActionsFunction={(item, option) => { this.handleMailsActions(item, option) }}
                                                    params={[
                                                        {
                                                            title: "Responsable",
                                                            name: "responsable",
                                                            type: "string",
                                                            responsive: "xs"
                                                        },
                                                        {
                                                            title: "Fecha",
                                                            name: "createdAtFormated",
                                                            type: "string",
                                                            responsive: "sm"
                                                        },
                                                        {
                                                            title: "Total de correos",
                                                            name: "emails",
                                                            type: "string",
                                                            responsive: "xs"
                                                        },
                                                        {
                                                            title: "Campaña",
                                                            name: "campaign",
                                                            type: "string",
                                                            responsive: "xs"
                                                        },
                                                    ]}
                                                />
                                                //   :
                                                //   ''
                                            }
                                        </div>
                                    </Grid>
                                </Grid>
                                :
                                <Empty
                                    title="¡No tienes emails!"
                                    description="No hay emails para mostrar."
                                />
                    }

                    <NewEmailModal
                        open={this.state.openModal}
                        handleClose={() => {
                            this.loadData()
                            this.setState({ openModal: false })
                        }}
                        data={this.state.mailSelected}
                    />
                </div>
            )
        } else {
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
)(Mailing)
