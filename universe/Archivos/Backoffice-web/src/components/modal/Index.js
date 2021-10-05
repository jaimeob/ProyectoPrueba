import React, { useState } from "react";
import ReactDOM from "react-dom";
//import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';

const styles = theme => ({
    paper: {
      position: 'absolute',
      width: theme.spacing.unit * 80,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing.unit * 2,
      outline: 'none',
    },
  });

function ModalAlert(props) {

  const {classes} = props

  console.log(props.classes, '<---------------- Buscando las clases')

  const [modalOpen, setModalOpen] = useState(true);

  const closeModal = () => {
    setModalOpen(false);
    props.exit();
  }

  return <Modal isOpen={modalOpen} className={classes.paper}>
    <div>
        <Typography>{props.title}</Typography>
        <Typography>{props.body}</Typography>
    </div>
    <CardActions>
      <Button onClick={closeModal} color="primary">Cerrar</Button>
    </CardActions>
  </Modal>
}

function ModalConfirm(props) {
  const [modalOpen, setModalOpen] = useState(true);

  const closeModal = () => {
    setModalOpen(false);
    props.exit();
  }

  const confirm = () => {
    if (props && props.onConfirm) props.onConfirm();
    closeModal();
  }

  const cancel = () => {
    if (props && props.onCancel) props.onCancel();
    closeModal();
  }

  return <Modal isOpen={modalOpen}>
    <Typography>{props.title}</Typography>
    <Typography>{props.body}</Typography>
    <CardActions>
      <Button onClick={cancel}>Cancelar</Button>
      <Button onClick={confirm} color="primary">Aceptar</Button>
    </CardActions>
  </Modal>
}



// alert box, returns a void promise (to know when it's closed)
async function showAlert(config) {
  return new Promise((res) => {
    renderModal(ModalAlert, {
      onClose: res,
      ...config
    })
  });
}

// confirm box, returns a boolean promise (yes or cancel)
async function showConfirm(config) {
  return new Promise((res) => {
    renderModal(ModalConfirm, {
      onConfirm: () => res(true),
      onCancel: () => res(false),
      ...config
    })
  })
}


function renderModal(Children, props) {

  /* Create div to show the modal */
  const div = document.createElement('div');
  document.body.appendChild(div);

  const exit = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (props && props.onClose) props.onClose();

  }

  ReactDOM.render(
    //<Provider store={store}>
      <Children exit={exit} {...props} />
    //</Provider>
  , div);

}

export {
  showAlert,
  showConfirm,
  renderModal
}