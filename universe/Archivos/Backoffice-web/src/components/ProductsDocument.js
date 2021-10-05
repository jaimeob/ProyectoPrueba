import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import * as XLSX from 'xlsx'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button } from '@material-ui/core'
import imgExcel from '../resources/images/excelImage.png'
import check from '../resources/images/check.png'

// Components
import Title from '../components/Title'
import UploadPruducts from '../components/UploadPruducts'
import { showSnackbar } from './Snackbar'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
    containerExcel: {
        margin: '0 auto',
        marginBottom: '2%',
        minWidth: 200,
        minHeight: '55vh',
        border: '2px dotted black'
    },
    centerImg:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imgDoc:{
        width: '60%',
        margin: '0 auto',
        [theme.breakpoints.down('sm')]: {
            width: '50%',
            display:'block',
            margin: '0 auto',
            height: '60%'
        }
    }
})

class ProductsDocument extends Component {
  constructor(props) {
    super(props)
    this.state = {
        excelDoc : null,
        msgRegistered: "Selecciona un documento.",
        productsRegistered: false,
    }

    this.sendJsonToApi = this.sendJsonToApi.bind(this)
    this.newDocument = this.newDocument.bind(this)
    this.readExcel = this.readExcel.bind(this)
  }


  async sendJsonToApi(){
      if(this.state.excelDoc !== null && this.state.excelDoc !== undefined && this.state.msgRegistered !== "Selecciona un documento."){
        let self = this
        try {
            let response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'POST',
                resource: 'products-detail',
                endpoint: '/create',
                data: this.state.excelDoc
    
            })

            if(response.data.created || response.data.edited){
                self.setState({
                    productsRegistered: true
                })
            }

        } catch (error) {
            console.log(error)
            showSnackbar({ variant: "error", message: `Ha ocurrido un error inesperado` })
        }
    }else{
      showSnackbar({ variant: "error", message: `No se ha seleccionado un documento.` })
    }
    
  }

readExcel = (event) => {
    let file = event.target.files[0]
    
    if(file !== null && file !== undefined){
        let self = this
        let fileName = file.name
        let fileType = file.type
        let fileSize = file.size
        
        if(fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){

            if( fileSize <= 127469 ){
                
                //Se lee el archivo y se convierte a JSON.
                const promise = new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);

                fileReader.onload = (e) => {
                    const bufferArray = e.target.result;

                    const wb = XLSX.read(bufferArray, { type: "buffer" });

                    const wsname = wb.SheetNames[0];

                    const ws = wb.Sheets[wsname];

                    const data = XLSX.utils.sheet_to_json(ws);

                    resolve(data);
                };

                fileReader.onerror = (error) => {
                    reject(error);
                };
                });
                
                //El resultado se almacena en el estado.
                promise.then((d) => {
                    let excelDoc = {
                        name: fileName,
                        data: d
                    }
                    self.setState({
                        excelDoc: excelDoc,
                        msgRegistered: `Se ha seleccionado el documento ${fileName}`,
                    })

                    showSnackbar({ variant: "success", message: `El archivo ${fileName} se ha cargado correctamente.` })
                });
            }else{
                showSnackbar({ variant: "warning", message: `El tamaño del archivo es demasiado grande.` })
                this.setState({
                    msgRegistered: "Selecciona un documento."
                })
            }

        }else{
            showSnackbar({ variant: "error", message: `El formato del archivo seleccionado no es valido.` })
        }
    }

    };

  newDocument(){
      this.setState({
        excelDoc : null,
        msgRegistered: "Selecciona un documento.",
        productsRegistered: false
      })
  }


  render() {
    const self = this
    const { classes } = this.props

    return (
      <Grid container >
        <Grid item xs={12} className={classes.containerExcel}>
          <Grid container style={{ height:'100%' }} >
              <Grid item xs={12} className={classes.centerImg} style={{ height: '100%' }}>
                    <div id="drop_zone" ondrop={(event) => { this.handleChangeFileValue(event) }} style={{width:300, display: 'block', alignItems:'center'}}>
                        <div className={classes.centerImg} style={{marginBottom:'3%'}}>
                            {
                                (this.state.productsRegistered)?
                                <Typography variant="body" style={{fontSize: 18}} align='center'>
                                    <strong>Los productos se han subido exitosamente.</strong>
                                </Typography>
                                :
                                <Typography variant="body" style={{fontSize: 18}} align='center'>
                                    <strong>{this.state.msgRegistered}</strong>
                                </Typography>
                            }
                            
                            
                        </div>

                        <div className={classes.centerImg}>
                            {
                                (this.state.productsRegistered)?
                                <img className={classes.imgDoc} src={check}/>
                                : <img className={classes.imgDoc} src={imgExcel}/>
                            }
                        </div>

                        <div className={classes.centerImg}>
                            {
                                (this.state.productsRegistered) ? 
                                <Button variant='contained' color='primary' style={{marginTop:'3%'}} onClick={this.newDocument}>Nuevo documento</Button>
                                :<>
                                    <input
                                        name={(this.state.excelDoc !== null && this.state.excelDoc !== undefined)? this.state.excelDoc.name : "No se ha seleccionado un archivo."}
                                        type="file"
                                        id="doc"
                                        style={{display:"none"}}
                                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        onChange={(event) => { this.readExcel(event)} }
                                    />
                                    
                                    <label for="doc" >
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            component="span"
                                        >
                                            Subir un documento
                                        </Button>
                                    </label>
                                </>
                            }
                            
                        </div>
                    </div>
              </Grid>
              <Grid item xs={12} style={{marginTop: '1.5%'}}>
                <Grid container>
                    <Grid item xs={4} md={2} style={{display:'block', marginLeft: 'auto'}}>
                        {
                            (this.state.productsRegistered) ?
                                null
                            : <Button variant='contained' color='primary' onClick={this.sendJsonToApi} fullWidth >Guardar</Button>
                        }
                    </Grid>
                </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductsDocument)