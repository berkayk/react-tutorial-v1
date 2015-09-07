var Comment = React.createClass({displayName: "Comment",
    render: function() {
        return (
            React.createElement("div", {className: "comment"}, 
                React.createElement("h2", {className: "commentAuthor"}, 
          this.props.author
                ), 
            this.props.children
            )
        );
    }
});

var CommentList = React.createClass({displayName: "CommentList",
    render: function() {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                React.createElement(Comment, {author: comment.author}, 
                    comment.text
                )
            );
        });
        return (
            React.createElement("div", {className: "commentList"}, 
                commentNodes
            )
        );
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
    handleSubmit: function(e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        // TODO: send request to the server
        this.props.onCommentSubmit({author: author, text: text});

        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function() {
        return (
            React.createElement("div", null, 
                React.createElement("hr", null), 
                React.createElement("form", {className: "commentForm form-inline", onSubmit: this.handleSubmit}, 
                    React.createElement("input", {className: "form-control", type: "text", placeholder: "Your name", ref: "author"}), 
                    React.createElement("input", {className: "form-control", type: "text", placeholder: "Say something...", ref: "text"}), 
                    React.createElement("input", {className: "btn btn-success", type: "submit", value: "Post"})
                )
            )
        );
    }
});

var CommentBox = React.createClass({displayName: "CommentBox",
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("URL: " + this.props.url, "Status: " + status, "Error: " + err.toString());
            }.bind(this)
        });
    },
    getInitialState: function(){
        return {data: []}
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            React.createElement("div", {className: "commentBox"}, 
                React.createElement("h1", null, "Comments"), 
                React.createElement(CommentList, {data: this.state.data}), 
                React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
            )
        );
    }
});


React.render(
React.createElement(CommentBox, {url: "comments.json", pollInterval: 20000}),
    document.getElementById('content')
);