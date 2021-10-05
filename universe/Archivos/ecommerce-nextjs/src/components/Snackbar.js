import ReactDOM from 'react-dom'

import { Snackbar, SnackbarContent } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import { useState } from 'react';

import classNames from "classnames"

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
}

const styles1 = theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

function Content(props) {
    const { classes, variant, className, message, onClose } = props;
    const Icon = variantIcon[variant];

    return <SnackbarContent
        className={classNames(classes[variant], className)}
        message={
            <span id="client-snackbar" className={classes.message}>
                <Icon className={classNames(classes.icon, classes.iconVariant)} />
                {message}
            </span>
        }
        action={[
            <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={onClose}
            >
                <CloseIcon className={classes.icon} />
            </IconButton>,
        ]}
    />

}

const CustomContent = withStyles(styles1)(Content)


function Snack(props) {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false)
        if (props && props.onClose) setTimeout(props.onClose, 500);
    }
    return <Snackbar
        open={open}
        autoHideDuration={props.autoHideDuration || 3000}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        onClose={handleClose}
    >

        <CustomContent
            onClose={handleClose}
            {...props}
        />
    </Snackbar>
}

export function showSnackbar(props) {

    /* Create div to show the modal */
    const div = document.createElement('div');
    document.body.appendChild(div);

    const exit = () => {
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (props && props.onClose) props.onClose();

    }

    ReactDOM.render(<Snack {...props} />, div);

}
